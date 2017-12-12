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
    if (hash !== playerKeys[i]) ctx.filter = "hue-rotate(40deg)";
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

    // DEBUG ONLY, DRAW COLLISION CIRCLE
    /**
    ctx.save();
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 30, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();
    **/
  }

  //loop and draw all bullets
  var bulletKeys = Object.keys(bullets);
  for (var _i = 0; _i < bulletKeys.length; _i++) {
    var bullet = bullets[bulletKeys[_i]];

    //draw bullet
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(bullet.rotation * (Math.PI / 180));

    ctx.drawImage(bulletImg, 0, 0, 20, 10, -20 * bullet.scale / 2, -10 * bullet.scale / 2, 20 * bullet.scale, 10 * bullet.scale);

    ctx.restore();

    // DEBUG ONLY, DRAW COLLISION CIRCLE
    /**
    ctx.save();
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 10, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();
    **/
  }

  //loop and draw all explosions
  for (var _i2 = 0; _i2 < explosions.length; _i2++) {
    var explosion = explosions[_i2];

    //draw Explosion

    //96 wide
    //96 high
    ctx.drawImage(explosionImg, 96 * explosion.currFrame, 96 * explosion.currRow, 96, 96, explosion.x - 48, explosion.y - 48, 96, 96);
  }

  for (var _i3 = 0; _i3 < splashes.length; _i3++) {
    var splash = splashes[_i3];
    //draw Splash

    ctx.drawImage(splashImg, 40 * splash.currFrame, 0, 40, 88, splash.x - 20, splash.y - 44, 40, 88);
  }

  //update all UI elements
  if (players[hash]) {

    roomUIText.textContent = "#" + (players[hash].room + 1);

    //Update Hull status

    hullUIText.textContent = players[hash].turrets.length + "/4 ";
    //Update Engine status

    var engineStatusText = '';
    switch (players[hash].speed) {
      case 0:
        engineStatusText = 'Idling';
        break;
      case 1:
        engineStatusText = 'Quarter Speed Ahead';
        break;
      case 2:
        engineStatusText = 'Half Speed Ahead';
        break;
      case 3:
        engineStatusText = 'Full Speed Ahead';
        break;
      default:
        engineStatusText = 'Full Reverse';
        break;
    }
    enginesUIText.textContent = "" + engineStatusText;
  } else {
    console.log("Don't have player yet.");
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
    player.room = receivedPlayer.room;
    player.speed = receivedPlayer.speed;
    //TURNING STATE WILL NOT BE SENT TO CLIENT
    //THIS PREVENTS SERVER OVERWRITING CLIENT INPUT

  }
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
    bullet.scale = receivedBullet.scale;
  }
};

// RPC for explosions
var addExplosion = function addExplosion(data) {
  var explosionObj = {
    x: data.x,
    y: data.y,
    currFrame: 0,
    currRow: 0,
    currDelay: 0 //Number of frames to wait before changing frame
    //5 wide, 3 tall
  };
  explosions.push(explosionObj);
};

var addSplash = function addSplash(data) {
  var splashObj = {
    x: data.x,
    y: data.y,
    framesRemaining: 25,
    currFrame: 0,
    currRow: 0,
    currDelay: 0 //Number of frames to wait before changing frame
    //25 wide, 1 tall
  };
  splashes.push(splashObj);
};

// fire cannon function - notify server bullet has been fired
var fireCannons = function fireCannons() {

  var packet = {
    ownerHash: hash,
    mouseX: mousePos.x,
    mouseY: mousePos.y
  };

  // console.log('fire!');

  //send hash for the player firing.
  socket.emit('playerFiring', packet);
};

// function to handle deleting a bullet from our bullets array
var deleteBullet = function deleteBullet(data) {
  delete bullets[data];
};

var deletePlayer = function deletePlayer(data) {
  delete players[data];
  if (data === hash) {
    socket.emit('playerRespawn');
    console.log('sending respawn request');
  }
};

// functions to handle keyUp and keyDown
var keyDownHandler = function keyDownHandler(e) {
  var player = players[hash];
  var keyPressed = e.which;

  //A or Left Arrow
  if (keyPressed === 65 || keyPressed === 37) {
    //console.log('LEFT HELD');
    //Set player turning state to 'left'
    prevTurningState = turningState;
    turningState = 'left';
  }

  //D or Right Arrow
  if (keyPressed === 68 || keyPressed === 39) {
    //console.log('RIGHT HELD');
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
    //console.log('UP RELEASED');
    //Send throttle up request to server
    sendThrottle(true);
  }

  //A or Left Arrow
  if (keyPressed === 65 || keyPressed === 37) {
    //console.log('LEFT RELEASED');
    //Set player turning state to 'none'
    prevTurningState = turningState;
    turningState = 'none';
  }

  //S or Down Arrow
  if (keyPressed === 83 || keyPressed === 40) {
    //console.log('DOWN RELEASED');
    //Send throttle down request to server
    sendThrottle(false);
  }

  //D or Right Arrow
  if (keyPressed === 68 || keyPressed === 39) {
    //console.log('RIGHT RELEASED');
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
  var packet = {
    hash: hash,
    rotations: []
  };

  var playerRotAsRad = player.rotation * (Math.PI / 180);

  //Rotating around the origin
  //x' = x cos(theta) - y sin(theta)
  //y' = y cos(theta) + x sin(theta)

  for (var i = 0; i < player.turrets.length; i++) {
    var turret = player.turrets[i];

    var newXOffset = turret.offsetX * Math.cos(playerRotAsRad) - turret.offsetY * Math.sin(playerRotAsRad);
    var newYOffset = turret.offsetY * Math.cos(playerRotAsRad) + turret.offsetX * Math.sin(playerRotAsRad);

    var newRotation = degBetweenPoints(player.x + newXOffset, player.y + newYOffset, mousePos.x, mousePos.y);

    newRotation -= player.rotation;

    packet.rotations[i] = newRotation;
  }

  //console.log('packet!');
  //console.dir(packet);

  socket.emit('playerTurretUpdate', packet);
};

// function to do when a collision is found, from the server
var collisionMade = function collisionMade(data) {
  console.log(data.playerHit + ' GOT HIT BY ' + data.playerHitBy);
};

// scaling bullet size (for arc)
var scaleBullet = function scaleBullet(bullet) {
  // CALCULATED SERVER-SDE
};
"use strict";

//Initialize clientside vars here, hook up events and get document Elements
var shipImg = void 0;
var shipTurretLargeImg = void 0;
var shipTurretSmallImg = void 0;
var oceanBGImg = void 0;
var explosionImg = void 0;
var bulletImg = void 0;
var splashImg = void 0;
var oceanBGPageImg = void 0;

//UI
var roomUIText = void 0;
var hullUIText = void 0;
var enginesUIText = void 0;

var players = {}; // object to hold all info to draw them on screen
var bullets = {};
var explosions = [];
var splashes = [];

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
"use strict";

//This is where our update loop goes if we decide to update anything client side

var update = function update() {
  //update explosions
  for (var i = 0; i < explosions.length; i++) {
    var explosion = explosions[i];

    explosion.currDelay++;

    if (explosion.currDelay > 2) {
      explosion.currDelay = 0;
      explosion.currFrame++;
      if (explosion.currFrame > 5) {
        explosion.currFrame = 0;
        explosion.currRow++;
        if (explosion.currRow > 3) {
          explosions.slice(i, 1);
        }
      }
    }
  }

  //update splashes
  for (var _i = 0; _i < splashes.length; _i++) {
    var splash = splashes[_i];

    splash.currDelay++;

    if (splash.currDelay > 2) {
      splash.currDelay = 0;
      splash.currFrame++;
      if (splash.currFrame > 25) {
        splashes.slice(_i, 1);
      }
    }
  }

  //sendTurning
  if (players[hash]) {
    sendTurning();
  }
};
