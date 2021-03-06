const players = [
  {}, // room 0
  {}, // room 1
  {}, // room 2
  {}, // room 3
  {}, // room 4
];
const bullets = [
  {}, // room 0
  {}, // room 1
  {}, // room 2
  {}, // room 3
  {}, // room 4
];

const getPlayersInRoom = roomNum => players[roomNum];

const getBulletsInRoom = roomNum => bullets[roomNum];

const getPlayer = (data) => {
  for (let i = 0; i < players.length; i++) {
    if (players[i][data]) {
      return players[i][data];
    }
  }
  return null;
};

const getBullet = (data) => {
  for (let i = 0; i < bullets.length; i++) {
    if (bullets[i][data]) {
      return bullets[i][data];
    }
  }
  return null;
};

const setPlayersInRoom = (data, roomNum) => {
  players[roomNum][data] = data;
};

const setBulletsInRoom = (data, roomNum) => {
  bullets[roomNum][data] = data;
};

const setPlayer = (data, roomNum) => {
  players[roomNum][data.hash] = data;
};

const setBullet = (data, roomNum) => {
  bullets[roomNum][data.hash] = data;
};

const removePlayer = (data) => {
  for (let i = 0; i < players.length; i++) {
    if (players[i][data]) {
      delete players[i][data];
    }
  }
};

const removeBullet = (data) => {
  for (let i = 0; i < bullets.length; i++) {
    if (bullets[i][data]) {
      delete bullets[i][data];
    }
  }
};

const checkHit = (x1, y1, r1, x2, y2, r2) => {
  const thickness = r1 + r2;
  if (x1 < x2 + thickness && x1 > x2 - thickness) {
    if (y1 < y2 + thickness && y1 > y2 - thickness) {
      return true;
    }
  }
  return false;
};

module.exports = {
  getPlayersInRoom,
  getBulletsInRoom,
  getPlayer,
  getBullet,
  setPlayersInRoom,
  setBulletsInRoom,
  setPlayer,
  setBullet,
  removePlayer,
  removeBullet,
  checkHit,
};
