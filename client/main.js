//Initialize clientside vars here, hook up events and get document Elements

let players = {}; // object to hold all info to draw them on screen
let bullets = {};
let decals = {};

// server info
let socket;
let hash;

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