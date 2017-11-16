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
    rotation: 0,
    speed: 1,
    turningState: 'none',
    turrets: [
      {
        offsetX: 0,
        offsetY: 50,
        rotation: 0,
      },
      {
        offsetX: 0,
        offsetY: -50,
        rotation: 0,
      },
      {
        offsetX: 20,
        offsetY: 0,
        rotation: 0,
      },
      {
        offsetX: -20,
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
      player.x += player.speed * player.fX;
      player.y += player.speed * player.fY;

      if (player.x > 600) {
        player.x = 1;
      }

      if (player.x < 0) {
        player.x = 599;
      }

      if (player.y > 600) {
        player.y = 1;
      }

      if (player.y < 0) {
        player.y = 599;
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

    onDisconnect(socket);
  });
};

module.exports.configure = configure;
