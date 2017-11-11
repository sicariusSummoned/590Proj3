//This is where we're putting the draw loop
"use strict";
"use strict";

//We put all functions here

// sync player function - takes data from server and updates client data accordingly
// WARNING, PLAYERS DELETED SERVER-SIDE WILL NOT BE DELETED CLIENT-SIDE
var syncPlayer = function syncPlayer(data) {
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
    player.rot = receivedPlayer.rot;
  }
};

var cullPlayers = function cullPlayers(data) {// delete players we dont need anymore

};

// sync bullets function - takes data from server and updates client data accordingly
var syncBullet = function syncBullet(data) {
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
    bullet.rot = receivedBullet.rot;
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

// functions to handle keyUp and keyDown

// function to get mousePosition

// function to get angle between two points

// function to notify server ship is turning

// function for acceleration / throttle

// scaling bullet size (for arc)
"use strict";

//Initialize clientside vars here, hook up events and get document Elements

var players = {}; // object to hold all info to draw them on screen
var bullets = {};
var decals = {};

// server info
var socket = void 0;
var hash = void 0;

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

  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext('2d');

  socket = io.connect();

  // placeholders for emits from server
  // socket.on('syncPlayer');
  // socket.on('generateRPC');

  // key up / key down event listener

  // mouse move listener

  // click event listener
};

window.onload = init;
//This is where our update loop goes if we decide to update anything client side
"use strict";
