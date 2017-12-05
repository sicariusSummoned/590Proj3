"use strict";

//This is where we're putting the draw loop

var redraw = function redraw(time) {
  //Call update
  update();

  //turn off filter
  ctx.filter = "none";

  //clear screen
  ctx.clearRect(0, 0, screen.width, screen.height);

  //Draw background
  ctx.drawImage(oceanBGImg, 0, 0, 1920, 1080, 0, 0, canvas.width, canvas.height);

  //loop and draw all players and their turrets
  var playerKeys = Object.keys(players);
  for (var i = 0; i < playerKeys.length; i++) {
    var player = players[playerKeys[i]];

    //Draw Ship Hull
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation * (Math.PI / 180));
    ctx.drawImage(shipImg, // our source image
    0, //Source X
    0, //Source Y
    221, //Source Width 221 pixels
    81, //Source Height 81 pixels
    -221 / 2, //Drawing at -221/2 because we translated canvas
    -81 / 2, //Drawing at -81/2 because we translated canvas
    221, //Draw Width
    81 //Draw Height
    );

    //To draw turrets should I not restore? until after all are drawn?

    //Draw Turrets   


    for (var j = 0; j < player.turrets.length; j++) {
      var turret = player.turrets[j];
      ctx.save();
      ctx.translate(turret.offsetX, turret.offsetY);
      ctx.rotate(turret.rotation * (Math.PI / 180));
      ctx.drawImage(shipTurretLargeImg, 0, 0, 20, //Source width
      25, //Source Height
      -20 / 2, -25 / 2, 20, 25);
      //reset for next turret's offset and rotation
      ctx.restore();
    }
    ctx.restore();
  }

  //loop and draw all bullets
  var bulletKeys = Object.keys(bullets);
  for (var _i = 0; _i < bulletKeys.length; _i++) {
    var bullet = bullets[bulletKeys[_i]];

    //draw bullet
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(bullet.rotation * (Math.PI / 180));

    ctx.drawImage(bulletImg, 0, 0, 20, 10, -20 / 2, -10 / 2, 20, 10);

    ctx.restore();
  }

  //loop and draw all explosions
  for (var _i2 = 0; _i2 < explosions.length; _i2++) {
    var explosion = explosions[_i2];

    //draw Explosion
    /**
    ctx.drawImage(
      explosionImg,
    );
    **/
  }

  animationFrame = requestAnimationFrame(redraw);
};
'use strict';

//We put all functions here

var mySpawn = function mySpawn(data) {
  hash = data.hash;
};

// sync player function - takes data from server and updates client data accordingly
// WARNING, PLAYERS DELETED SERVER-SIDE WILL NOT BE DELETED CLIENT-SIDE
var syncPlayers = function syncPlayers(data) {
  var keys = Object.keys(data);

  for (var i = 0; i < keys.length; i++) {
    var receivedPlayer = data[keys[i]];

    if (!players[receivedPlayer.hash]) {
      // if doesnt exist, create one;
      players[receivedPlayer.hash] = receivedPlayer;
      return;
    }

    var player = players[receivedPlayer.hash];

    player.x = receivedPlayer.x;
    player.y = receivedPlayer.y;
    player.rotation = receivedPlayer.rotation;
    player.turrets = receivedPlayer.turrets;

    //TURNING STATE WILL NOT BE SENT TO CLIENT
    //THIS PREVENTS SERVER OVERWRITING CLIENT INPUT

  }
};

var cullPlayers = function cullPlayers(data) {// delete players we dont need anymore

};

// sync bullets function - takes data from server and updates client data accordingly
var syncBullets = function syncBullets(data) {
  var keys = Object.keys(data);

  for (var i = 0; i < keys.length; i++) {
    var receivedBullet = data[keys[i]];

    if (!bullets[receivedBullet.hash]) {
      // if doesn't exist, create one;
      bullets[receivedBullet.hash] = receivedBullet;
      return;
    }

    var bullet = bullets[receivedBullet.hash];

    bullet.x = receivedBullet.x;
    bullet.y = receivedBullet.y;
    bullet.rotation = receivedBullet.rotation;
  }
};

// RPC for explosions
var generateExplosion = function generateExplosion(data) {
  var explosionObj = {
    x: data.x,
    y: data.y,
    framesRemaining: 0 // WARNING - REPLACE WITH # OF FRAMES ON SPRITESHEET
  };
};

// fire cannon function - notify server bullet has been fired
var fireCannons = function fireCannons() {

  var packet = {
    ownerHash: hash
  };

  console.log('fire!');

  //send hash for the player firing.
  socket.emit('playerFiring', packet);
};

// functions to handle keyUp and keyDown
var keyDownHandler = function keyDownHandler(e) {
  var player = players[hash];
  var keyPressed = e.which;

  //A or Left Arrow
  if (keyPressed === 65 || keyPressed === 37) {
    console.log('LEFT HELD');
    //Set player turning state to 'left'
    prevTurningState = turningState;
    turningState = 'left';
  }

  //D or Right Arrow
  if (keyPressed === 68 || keyPressed === 39) {
    console.log('RIGHT HELD');
    //Set player turning state to 'right'
    prevTurningState = turningState;
    turningState = 'right';
  }

  // stop scrolling on screen
  if (keyPressed === 87 || keyPressed === 38 || keyPressed === 83 || keyPressed === 40) {
    e.preventDefault();
  }
};

var keyUpHandler = function keyUpHandler(e) {
  var player = players[hash];
  var keyPressed = e.which;

  //W or Up Arrow
  if (keyPressed === 87 || keyPressed === 38) {
    console.log('UP RELEASED');
    //Send throttle up request to server
    sendThrottle(true);
  }

  //A or Left Arrow
  if (keyPressed === 65 || keyPressed === 37) {
    console.log('LEFT RELEASED');
    //Set player turning state to 'none'
    prevTurningState = turningState;
    turningState = 'none';
  }

  //S or Down Arrow
  if (keyPressed === 83 || keyPressed === 40) {
    console.log('DOWN RELEASED');
    //Send throttle down request to server
    sendThrottle(false);
  }

  //D or Right Arrow
  if (keyPressed === 68 || keyPressed === 39) {
    console.log('RIGHT RELEASED');
    //Set player turning state to 'none'
    prevTurningState = turningState;
    turningState = 'none';
  }
};

// function to get mousePosition
var getMousePosition = function getMousePosition(canvas, e) {
  var rect = canvas.getBoundingClientRect();
  mousePos.x = e.clientX - rect.left;
  mousePos.y = e.clientY - rect.top;

  // console.log(`X:${mousePos.x} Y:${mousePos.y}`);
};

// function to get angle between two points
var degBetweenPoints = function degBetweenPoints(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
};

// function to notify server ship is turning
var sendTurning = function sendTurning() {
  var packet = {
    hash: hash,
    turningState: turningState
  };

  if (prevTurningState !== turningState) {
    socket.emit('playerTurning', packet);
    //console.log('SENDING!');
  } else {
      //console.log('NOT SENDING TURN UPDATE');
    }
};

// function for acceleration / throttle
var sendThrottle = function sendThrottle(accelerating) {
  var packet = {
    hash: hash
  };

  //is the player accelerating or decelerating?
  if (accelerating) {
    packet.accelerating = true;
  } else {
    packet.accelerating = false;
  }

  socket.emit('playerThrottling', packet);
};

var turretRotation = function turretRotation() {
  var player = players[hash];

  var newRotation = degBetweenPoints(player.x, player.y, mousePos.x, mousePos.y);
  newRotation -= player.rotation;
  console.log(newRotation);
  var packet = {
    hash: hash,
    rotation: newRotation
  };

  socket.emit('playerTurretUpdate', packet);
};

// scaling bullet size (for arc)
var scaleBullet = function scaleBullet(bulletHash) {};
"use strict";

//Initialize clientside vars here, hook up events and get document Elements
var shipImg = void 0;
var shipTurretLargeImg = void 0;
var shipTurretSmallImg = void 0;
var oceanBGImg = void 0;
var explosionImg = void 0;
var bulletImg = void 0;

var players = {}; // object to hold all info to draw them on screen
var bullets = {};
var explosions = [];

// server info
var socket = void 0;
var hash = void 0;
var animationFrame = void 0;

var prevTurningState = void 0;
var turningState = void 0;
// spriteSheet elements

var mousePos = {
  x: 0,
  y: 0

  // canvas elements
};var canvas = void 0;
var ctx = void 0;

var debug = void 0; // boolean for drawing collision boxes

var init = function init() {
  debug = false;

  // get image elements from index.html
  oceanBGImg = document.querySelector("#oceanBG");
  shipImg = document.querySelector("#ship");
  shipTurretLargeImg = document.querySelector("#ship_Turret_Large");
  shipTurretSmallImg = document.querySelector("#ship_Turret_Small");
  bulletImg = document.querySelector("#bullet");
  explosionImg = document.querySelector("#explosion");

  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext('2d');

  socket = io.connect();

  //emits from server
  socket.on('newSpawn', mySpawn);
  socket.on('syncPlayers', syncPlayers);
  socket.on('syncBullets', syncBullets);
  // socket.on('generateRPC');

  // key up / key down event listener
  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
  // mouse move listener
  window.addEventListener('mousemove', function (e) {
    getMousePosition(canvas, e);
    turretRotation();
  });

  // click event listener
  window.addEventListener('click', function (e) {
    fireCannons();
  });

  requestAnimationFrame(redraw);

  setInterval(update, 30);
};

window.onload = init;
"use strict";

//This is where our update loop goes if we decide to update anything client side

var update = function update() {
  //update explosions lifetimes

  //Scale all bullets based on distance from their half way point

  //sendTurning
  sendTurning();
};
