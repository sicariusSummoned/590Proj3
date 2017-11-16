let players = {};
let bullets = {};

const getPlayers = () => players;
const getBullets = () => bullets;

const getPlayerByHash = data => players[data];

const getBulletByHash = data => bullets[data];

const setPlayers = (data) => {
  players = data;
};

const setBullets = (data) => {
  bullets = data;
};

const setPlayer = (data) => {
  players[data.hash] = data;
};

const setBullet = (data) => {
  bullets[data.hash] = data;
};

const removePlayerByHash = (data) => {
  delete players[data];
};

const removeBulletByHash = (data) => {
  delete bullets[data];
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
  getPlayers,
  getBullets,
  getPlayerByHash,
  getBulletByHash,
  setPlayers,
  setBullets,
  setPlayer,
  setBullet,
  removePlayerByHash,
  removeBulletByHash,
  checkHit,
};
