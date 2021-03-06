//Initialize clientside vars here, hook up events and get document Elements
let shipImg;
let shipTurretLargeImg;
let shipTurretSmallImg;
let oceanBGImg;
let explosionImg;
let bulletImg;
let splashImg;
let oceanBGPageImg;

//UI
let roomUIText;
let hullUIText;
let enginesUIText;

let players = {}; // object to hold all info to draw them on screen
let bullets = {};
let explosions = [];
let splashes = [];

// server info
let socket;
let hash;
let animationFrame;

let prevTurningState;
let turningState;
// spriteSheet elements

let mousePos = {
  x: 0,
  y: 0,
}

// canvas elements
let canvas;
let ctx;

let debug; // boolean for drawing collision boxes

const init = () => {
  debug = false;

  // get image elements from index.html
  oceanBGImg = document.querySelector("#oceanBG");
  shipImg = document.querySelector("#ship");
  shipTurretLargeImg = document.querySelector("#ship_Turret_Large");
  shipTurretSmallImg = document.querySelector("#ship_Turret_Small");
  bulletImg = document.querySelector("#bullet");
  explosionImg = document.querySelector("#explosion");
  splashImg = document.querySelector("#splash");
  oceanBGPageImg = document.querySelector("#oceanBG-page");

  //UI elements
  roomUIText = document.querySelector("#roomUI");
  hullUIText = document.querySelector("#hullUI");
  enginesUIText = document.querySelector("#enginesUI");

  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext('2d');

  socket = io.connect();

  //emits from server
  socket.on('newSpawn', mySpawn);
  socket.on('syncPlayers', syncPlayers);
  socket.on('syncBullets', syncBullets);
  socket.on('deleteBullet', deleteBullet);
  socket.on('deletePlayer', deletePlayer);
  socket.on('collisionMade', collisionMade);
  socket.on('newExplosion', addExplosion);
  socket.on('newSplash', addSplash);

  // key up / key down event listener
  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
  // mouse move listener
  window.addEventListener('mousemove', function (e) {
    getMousePosition(canvas, e);
    if (players[hash]) {
      turretRotation();
    }
  });

  // click event listener
  window.addEventListener('click', function (e) {
    if (players[hash]) {
      fireCannons();
    }
  });

  requestAnimationFrame(redraw);

  setInterval(update, 30);
};

window.onload = init;
