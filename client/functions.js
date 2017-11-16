//We put all functions here

const mySpawn = (data) =>{
  hash = data.hash;
  
}

// sync player function - takes data from server and updates client data accordingly
// WARNING, PLAYERS DELETED SERVER-SIDE WILL NOT BE DELETED CLIENT-SIDE
const syncPlayers = (data) => {
  const keys = Object.keys(data);

  for (let i = 0; i < keys.length; i++) {
    let receivedPlayer = data[keys[i]];

    if (!players[receivedPlayer.hash]) { // if doesnt exist, create one;
      players[receivedPlayer.hash] = receivedPlayer;
      return;
    }

    let player = players[receivedPlayer.hash];

    player.x = receivedPlayer.x;
    player.y = receivedPlayer.y;
    player.rotation = receivedPlayer.rotation;
    player.turrets = receivedPlayer.turrets;

    //TURNING STATE WILL NOT BE SENT TO CLIENT
    //THIS PREVENTS SERVER OVERWRITING CLIENT INPUT


  }
};

const cullPlayers = (data) => { // delete players we dont need anymore

};

// sync bullets function - takes data from server and updates client data accordingly
const syncBullets = (data) => {
  const keys = Object.keys(data);

  for (let i = 0; i < keys.length; i++) {
    let receivedBullet = data[keys[i]];

    if (!bullets[receivedBullet.hash]) { // if doesn't exist, create one;
      bullets[receivedBullet.hash] = receivedBullet;
      return;
    }

    let bullet = bullets[receivedBullet.hash];

    bullet.x = receivedBullet.x;
    bullet.y = receivedBullet.y;
    bullet.rotation = receivedBullet.rotation;
  }
};

// RPC for explosions
const generateExplosion = (data) => {
  let explosionObj = {
    x: data.x,
    y: data.y,
    framesRemaining: 0, // WARNING - REPLACE WITH # OF FRAMES ON SPRITESHEET
  };
};

// fire cannon function - notify server bullet has been fired
const fireCannons = () => {
  let player = players[hash];

  let packet = {
    ownerHash: hash,
  };

  //send hash for the player firing.
  socket.emit('playerFiring', packet);
};

// functions to handle keyUp and keyDown
const keyDownHandler = (e) => {
  let player = players[hash];
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

};

const keyUpHandler = (e) => {
  let player = players[hash];
  var keyPressed = e.which;

  //W or Up Arrow
  if (keyPressed === 87 || keyPressed === 38) {
    console.log('UP RELEASED');
    //Send throttle up request to server
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
const getMousePosition = (canvas, e) => {
  let rect = canvas.getBoundingClientRect();
  mousePos.x = e.clientX - rect.left;
  mousePos.y = e.clientY - rect.top;

  // console.log(`X:${mousePos.x} Y:${mousePos.y}`);
};

// function to get angle between two points
const degBetweenPoints = (x1, y1, x2, y2) => {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
};

// function to notify server ship is turning
const sendTurning = () => {
  let packet = {
    hash: hash,
    turningState: turningState,
  }

  if(prevTurningState !== turningState) {
    socket.emit('playerTurning', packet);
    console.log('SENDING!');
  } else {
    console.log('NOT SENDING TURN UPDATE');
  }
};

// function for acceleration / throttle
const sendThrottle = (accelerating) => {

  let packet = {
    hash: hash,
  };

  //is the player accelerating or decelerating?
  if (accelerating) {
    packet.accelerating = true;
  } else {
    packet.accelerating = false;
  }

  socket.emit('playerThrottling', packet);
};

// scaling bullet size (for arc)
const scaleBullet = (bulletHash) => {

};
