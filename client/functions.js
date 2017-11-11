//We put all functions here

// sync player function - takes data from server and updates client data accordingly
// WARNING, PLAYERS DELETED SERVER-SIDE WILL NOT BE DELETED CLIENT-SIDE
const syncPlayer = (data) => {
  const keys = Object.keys(data);
  
  for(let i = 0; i < keys.length; i++) {
    let receivedPlayer = data[keys[i]];
    
    if(!players[receivedPlayer.hash]) { // if doesnt exist, create one;
      players[receivedPlayer.hash] = receivedPlayer;
      return;
    }
    
    let player = players[receivedPlayer.hash];
    
    player.x = receivedPlayer.x;
    player.y = receivedPlayer.y;
    player.rot = receivedPlayer.rot;
  }
};

const cullPlayers = (data) => { // delete players we dont need anymore
  
};

// sync bullets function - takes data from server and updates client data accordingly
const syncBullet = (data) => {
  const keys = Object.keys(data);
  
  for(let i = 0; i < keys.length; i++) {
    let receivedBullet = data[keys[i]];
    
    if(!bullets[receivedBullet.hash]) { // if doesn't exist, create one;
      bullets[receivedBullet.hash] = receivedBullet;
      return;
    }
    
    let bullet = bullets[receivedBullet.hash];
    
    bullet.x = receivedBullet.x;
    bullet.y = receivedBullet.y;
    bullet.rot = receivedBullet.rot;
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

// functions to handle keyUp and keyDown

// function to get mousePosition

// function to get angle between two points

// function to notify server ship is turning

// function for acceleration / throttle

// scaling bullet size (for arc)