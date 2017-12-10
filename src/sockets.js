let io;

const xxh = require('xxhashjs');

const utility = require('./gameUtilities.js');

let runOnce = false;

const roomPop = [
  0,
  0,
  0,
  0,
  0,
];

// Here is where we should put all our socket methods
// send Players
const sendPlayers = (roomNum) => {
  const sendable = {};
  const serverPlayers = utility.getPlayersInRoom(roomNum);
  const keys = Object.keys(serverPlayers);

  for (let i = 0; i < keys.length; i++) {
    const serverPlayer = serverPlayers[keys[i]];
    sendable[serverPlayer.hash] = {
      room: serverPlayer.room,
      hash: serverPlayer.hash,
      x: serverPlayer.x,
      y: serverPlayer.y,
      rotation: serverPlayer.rotation,
      turrets: serverPlayer.turrets,
      speed: serverPlayer.speed,
    };
  }

  if (Object.keys(sendable).length > 0) {
    io.sockets.in(`${roomNum}`).emit('syncPlayers', sendable);
  }
  return true;
};

// function to calculate collision between ship and bullets
const checkCollision = (bullet, ship) => {
  return utility.checkHit(bullet.x, bullet.y, bullet.radius, ship.x, ship.y, ship.radius);
};

// delete Bullet
const deleteBullet = (hash, roomNum) => {
  utility.removeBullet(hash);
  io.sockets.in(`${roomNum}`).emit('deleteBullet', hash);
};

// send Bullets
const sendBullets = (roomNum) => {
  const sendable = {};
  const serverBullets = utility.getBulletsInRoom(roomNum);
  const keys = Object.keys(serverBullets);


  for (let i = 0; i < keys.length; i++) {
    const serverBullet = serverBullets[keys[i]];
    sendable[serverBullet.hash] = {
      room: serverBullet.room,
      hash: serverBullet.hash,
      x: serverBullet.x,
      y: serverBullet.y,
      rotation: serverBullet.rotation,
      scale: serverBullet.scale,
    };
  }

  if (Object.keys(sendable).length > 0) {
    io.sockets.in(`${roomNum}`).emit('syncBullets', sendable);
  }
  return true;
};

const sendAll = () => {
  for (let i = 0; i < roomPop.length; i++) {
    const roomNum = i;
    sendBullets(roomNum);
    sendPlayers(roomNum);
  }
};


// initialize new player
const makeNewPlayer = (sock, playerHash, roomNum) => {
  console.log(`making player in room ${roomNum}`);
  roomPop[roomNum]++;
  const socket = sock;

  const randX = Math.floor(Math.random() * 1000);
  const randY = Math.floor(Math.random() * 800);

  const Player = {
    room: roomNum,
    hash: playerHash,
    x: randX,
    y: randY,
    fX: 0,
    fY: 1,
    rotation: 90,
    speed: 1,
    turningState: 'none',
    radius: 30,
    turrets: [
      {
        offsetX: 16,
        offsetY: 20,
        rotation: 0,
      },
      {
        offsetX: 16,
        offsetY: -20,
        rotation: 0,
      },
      {
        offsetX: 50,
        offsetY: 0,
        rotation: 0,
      },
      {
        offsetX: -36,
        offsetY: 0,
        rotation: 0,
      },
    ],
  };

  utility.setPlayer(Player, roomNum);

  // Send new player to the correct socket.

  socket.emit('newSpawn', utility.getPlayer(Player.hash));
  sendPlayers(roomNum);
};

// disconnect code
const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    console.log('user disconnected');

    // remove player data from players object
    utility.removePlayer(socket.hash);
    // tell socket to leave
    socket.leave();

    sendAll();
  });
};

const serverUpdate = () => {
  for (let ik = 0; ik < roomPop.length; ik++) {
    const roomNum = ik;

    const bullets = utility.getBulletsInRoom(roomNum);
    const players = utility.getPlayersInRoom(roomNum);

    const bulletKeys = Object.keys(bullets);
    const playerKeys = Object.keys(players);

    for (let i = 0; i < playerKeys.length; i++) {
      const player = players[playerKeys[i]];

      // move players
      if (player !== null && player !== undefined) {
        // see if they are rotating or not
        if (player.turningState === 'right') {
          player.rotation += 1;
        }

        if (player.turningState === 'left') {
          player.rotation -= 1;
        }

        const asRad = player.rotation * (Math.PI / 180);

        player.fX = Math.cos(asRad);
        player.fY = Math.sin(asRad);

        player.x += player.speed * player.fX;
        player.y += player.speed * player.fY;

        if (player.x > 1110) {
          player.x = -109;
        }

        if (player.x < -110) {
          player.x = 1099;
        }

        if (player.y > 910) {
          player.y = -109;
        }

        if (player.y < -110) {
          player.y = 909;
          console.log(player.y);
        }

        utility.setPlayer(player, roomNum);
      }
    }

    // move bullets
    for (let i = 0; i < bulletKeys.length; i++) {
      const bullet = bullets[bulletKeys[i]];

      if (bullet !== null && bullet !== undefined) {
        bullet.x += bullet.speed * bullet.fX;
        bullet.y += bullet.speed * bullet.fY;

        // calc new distance travelled
        // calculate distance between firing and where landing
        const xDist = (bullet.originX - bullet.x) * (bullet.originX - bullet.x);
        const yDist = (bullet.originY - bullet.y) * (bullet.originY - bullet.y);
        bullet.distanceTravelled = Math.sqrt(xDist + yDist);

        // scale bullet according to distance travelled
        if (bullet.distanceTravelled <= (bullet.maxDistance / 2)) {
          bullet.scale += 0.1;
        }

        if (bullet.distanceTravelled > (bullet.maxDistance / 2)) {
          bullet.scale -= 0.1;
        }

        // check for collisions ONLY IN LAST 99.99% OF TRAVELLING
        let percentTravelled = bullet.distanceTravelled * 100;
        percentTravelled /= bullet.maxDistance;

        if (percentTravelled >= 100) { // go through all players in room, check for collisions
          for (let j = 0; j < playerKeys.length; j++) {
            const player = players[playerKeys[j]];

            if (bullet.ownerHash !== player.hash) { // cannot collide with own bullets
              if (checkCollision(bullet, player)) {
                const data = {
                  playerHit: player.hash,
                  playerHitBy: bullet.ownerHash,
                };
                io.sockets.in(`${roomNum}`).emit('collisionMade', data);
                deleteBullet(bullet.hash, bullet.room);
                break;
              }
            }
          }
        }
        if (bullet.distanceTravelled >= bullet.maxDistance) { // if too far, delete bullet
          // console.log(`GOING TOO FAR!`);
          deleteBullet(bullet.hash);
        } else {
          utility.setBullet(bullet, bullet.room);
        }
      } else {
        console.log('UNDEFINED OR NULL BULLET');
      }
    }
  }
};

// function for changing the turningState of the player
const playerTurning = (data) => {
  const player = utility.getPlayer(data.hash);
  if (player !== null) {
    player.turningState = data.turningState;
    utility.setPlayer(player, player.room);
  }
};

// function for changing the speed of the player
const playerThrottling = (data) => {
  const player = utility.getPlayer(data.hash);
  if (player !== null) {
    if (data.accelerating) {
      if (player.speed === -0.25) {
        player.speed = 0; // make the player go back up to not moving
      } else if (player.speed === 3) {
        player.speed = 3; // remain the same if max speed
      } else { // if anything else, we increase
        player.speed++;
      }
    }
    if (!data.accelerating) { // if DECREASING speed
      if (player.speed === -0.25) {
        player.speed = -0.25; // remain the same if min speed
      } else if (player.speed === 0) {
        player.speed = -0.25; // remain the same if max speed
      } else { // if anything else, we increase
        player.speed--;
      }
    }
    utility.setPlayer(player, player.room);
  }
};

const playerTurretUpdate = (data) => {
  const player = utility.getPlayer(data.hash);


  if (player !== null) {
    for (let i = 0; i < player.turrets.length; i++) {
      player.turrets[i].rotation = data.rotations[i];
    }
  }
  utility.setPlayer(player, player.room);
};


// function to ceate a new bullet for the player that was firing
const playerFiring = (data) => {
  // console.log('fire!');

  const player = utility.getPlayer(data.ownerHash);

  console.log(player.turrets.length);
  for (let i = 0; i < player.turrets.length; i++) {
    const turret = player.turrets[i];
    console.log(`In loop ${i}`);
    console.log(`turrOffsets: ${turret.offsetX} ${turret.offsetY}`);

    const hash = xxh.h32(`${Math.random() * 3}${new Date().getTime}`, 0xCAFEBABE).toString(16);
    console.log(hash);

    const rotation = turret.rotation + player.rotation;

    const turRotAsRad = rotation * (Math.PI / 180);

    const playRotAsRad = player.rotation * (Math.PI / 180);

    const bulletfX = Math.cos(turRotAsRad);
    const bulletfY = Math.sin(turRotAsRad);


    // x' = x cos(theta) - y sin(theta)
    // y' = y cos(theta) + x sin(theta)

    let newX = turret.offsetX * Math.cos(playRotAsRad);
    newX -= turret.offsetY * Math.sin(playRotAsRad);
    let newY = turret.offsetY * Math.cos(playRotAsRad);
    newY += turret.offsetX * Math.sin(playRotAsRad);

    // calculate distance between firing and where landing
    const xDist = (data.mouseX - (player.x + newX)) * (data.mouseX - (player.x + newX));
    const yDist = (data.mouseY - (player.y + newY)) * (data.mouseY - (player.y + newY));
    const maxDistance = Math.sqrt(xDist + yDist);

    // calculate speed fom maxDistance
    const speed = maxDistance / 100;

    const Bullet = {
      room: player.room,
      ownerHash: data.ownerHash,
      hash,
      originX: player.x + newX,
      originY: player.y + newY,
      x: player.x + newX,
      y: player.y + newY,
      fX: bulletfX,
      fY: bulletfY,
      destX: data.mouseX,
      destY: data.mouseY,
      rotation: turret.rotation + player.rotation,
      scale: 1,
      speed,
      distanceTravelled: 0,
      maxDistance,
      radius: 10,
    };
    utility.setBullet(Bullet, Bullet.room);
  }
};


// This gets called by app when it runs
const configure = (ioServer) => {
  io = ioServer;

  if (!runOnce) {
    runOnce = true;

    setInterval(serverUpdate, 30);
    setInterval(sendAll, 30);
  }

  // This gets called once on every player connection
  io.on('connection', (sock) => {
    const socket = sock;
    console.log('connection started');

    let roomToJoin = 0;

    if (roomPop[0] <= 3) {
      roomToJoin = 0;
    } else if (roomPop[1] <= 3) {
      roomToJoin = 1;
    } else if (roomPop[2] <= 3) {
      roomToJoin = 2;
    } else if (roomPop[3] <= 3) {
      roomToJoin = 3;
    } else if (roomPop[4] <= 3) {
      roomToJoin = 4;
    } else {
      return;
    }

    socket.join(`${roomToJoin}`);

    const hash = xxh.h32(`${socket.id}${new Date().getTime}`, 0xCAFEBABE).toString(16);

    socket.hash = hash;

    // Spawn new player at hash
    makeNewPlayer(socket, socket.hash, roomToJoin);

    // List all socket methods here
    socket.on('playerTurning', playerTurning);
    socket.on('playerThrottling', playerThrottling);
    socket.on('playerTurretUpdate', playerTurretUpdate);
    socket.on('playerFiring', playerFiring);
    onDisconnect(socket);
  });
};

module.exports.configure = configure;
