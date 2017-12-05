let io;

const xxh = require('xxhashjs');

const utility = require('./gameUtilities.js');

let runOnce = false;

// Here is where we should put all our socket methods

// send Players
const sendPlayers = () => {
  const sendable = {};
  const serverPlayers = utility.getPlayers();
  const keys = Object.keys(serverPlayers);

  for (let i = 0; i < keys.length; i++) {
    const serverPlayer = serverPlayers[keys[i]];
    sendable[serverPlayer.hash] = {
      hash: serverPlayer.hash,
      x: serverPlayer.x,
      y: serverPlayer.y,
      rotation: serverPlayer.rotation,
      turrets: serverPlayer.turrets,
    };
  }

  if (Object.keys(sendable).length > 0) {
    io.sockets.in('room1').emit('syncPlayers', sendable);
  }
  return true;
};

// send Bullets
const sendBullets = () => {
  const sendable = {};
  const serverBullets = utility.getBullets();
  const keys = Object.keys(serverBullets);

  for (let i = 0; i < keys.length; i++) {
    const serverBullet = serverBullets[keys[i]];
    sendable[serverBullet.hash] = {
      hash: serverBullet.hash,
      x: serverBullet.x,
      y: serverBullet.y,
      rotation: serverBullet.rotation,
    };
  }

  if (Object.keys(sendable).length > 0) {
    io.sockets.in('room1').emit('syncBullets', sendable);
  }
  return true;
};

const sendAll = () => {
  sendBullets();
  sendPlayers();
};


// initialize new player
const makeNewPlayer = (sock, playerHash) => {
  const socket = sock;

  const randX = Math.floor(Math.random() * 1000);
  const randY = Math.floor(Math.random() * 800);

  const Player = {
    hash: playerHash,
    x: randX,
    y: randY,
    fX: 0,
    fY: 1,
    rotation: 90,
    speed: 1,
    turningState: 'none',
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

  utility.setPlayer(Player);

  // Send new player to the correct socket.

  socket.emit('newSpawn', utility.getPlayerByHash(Player.hash));
  sendPlayers();
};

// disconnect code
const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    console.log('user disconnected');

    // remove player data from players object
    utility.removePlayerByHash(socket.hash);
    // tell socket to leave
    socket.leave();

    sendPlayers();
  });
};

const serverUpdate = () => {
  const bullets = utility.getBullets();
  const players = utility.getPlayers();

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

      utility.setPlayer(player);
    }
  }

  // move bullets
  for (let i = 0; i < bulletKeys.length; i++) {
    const bullet = bullets[bulletKeys[i]];

    if (bullet !== null && bullet !== undefined) {
      bullet.x += bullet.speed * bullet.fX;
      bullet.y += bullet.speed * bullet.fY;

      utility.setBullet(bullet);
    } else {
      console.log('UNDEFINED OR NULL');
    }
  }
};

// function for changing the turningState of the player
const playerTurning = (data) => {
  const player = utility.getPlayerByHash(data.hash);
  if (player !== null) {
    player.turningState = data.turningState;
    utility.setPlayer(player);
  }
};

// function for changing the speed of the player
const playerThrottling = (data) => {
  const player = utility.getPlayerByHash(data.hash);
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
    utility.setPlayer(player);
  }
};

const playerTurretUpdate = (data) => {
  const player = utility.getPlayerByHash(data.hash);


  if (player !== null) {
    for (let i = 0; i < player.turrets.length; i++) {
      player.turrets[i].rotation = data.rotations[i];
    }
  }
  utility.setPlayer(player);
};

// function to ceate a new bullet for the player that was firing
const playerFiring = (data) => {
  console.log(`fire!`);

  let player = utility.getPlayerByHash(data.ownerHash);

  console.log(player.turrets.length);
  for (let i = 0; i < player.turrets.length; i++) {
    let turret = player.turrets[i];
    console.log(`In loop ${i}`);
    console.log(`turrOffsets: ${turret.offsetX} ${turret.offsetY}`);

    const hash = xxh.h32(`${Math.random()*3}${new Date().getTime}`, 0xCAFEBABE).toString(16);
    console.log(hash);

    const rotation = turret.rotation + player.rotation
    
    const turRotAsRad = rotation * (Math.PI / 180);

    const playRotAsRad = player.rotation * (Math.PI/ 180);
    
    let bulletfX = Math.cos(turRotAsRad);
    let bulletfY = Math.sin(turRotAsRad);
    
    
    //x' = x cos(theta) - y sin(theta)
    //y' = y cos(theta) + x sin(theta)
    
    let newX = turret.offsetX*Math.cos(playRotAsRad) - turret.offsetY*Math.sin(playRotAsRad);
    let newY = turret.offsetY*Math.cos(playRotAsRad) + turret.offsetX*Math.sin(playRotAsRad);

    const Bullet = {
      ownerHash: data.ownerHash,
      hash: hash,
      x: player.x + newX,
      y: player.y + newY,
      fX: bulletfX,
      fY: bulletfY,
      rotation: turret.rotation + player.rotation,
      speed: 6,
    };
    utility.setBullet(Bullet);
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
    socket.join('room1');

    const hash = xxh.h32(`${socket.id}${new Date().getTime}`, 0xCAFEBABE).toString(16);

    socket.hash = hash;

    // Spawn new player at hash
    makeNewPlayer(socket, socket.hash);

    // List all socket methods here
    socket.on('playerTurning', playerTurning);
    socket.on('playerThrottling', playerThrottling);
    socket.on('playerTurretUpdate', playerTurretUpdate);
    socket.on('playerFiring', playerFiring);
    onDisconnect(socket);
  });
};

module.exports.configure = configure;
