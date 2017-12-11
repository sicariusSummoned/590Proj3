//This is where our update loop goes if we decide to update anything client side

const update = () => {
  //update explosions
  for (let i = 0; i < explosions.length; i++) {
    let explosion = explosions[i];

    explosion.currDelay++;

    if (explosion.currDelay > 2) {
      explosion.currDelay = 0;
      explosion.currFrame++;
      if (explosion.currFrame > 5) {
        explosion.currFrame = 0;
        explosion.currRow++;
        if(explosion.currRow>3){
          explosions.slice(i,1);
        }
      }
    }
  }



  //update splashes
  for (let i = 0; i < splashes.length; i++) {
    let splash = splashes[i];
    
    splash.currDelay++;
    
    if(splash.currDelay>2){
      splash.currDelay =0;
      splash.currFrame++;
      if(splash.currFrame>25){
        splashes.slice(i,1);
      }
    }
  }



  //sendTurning
  if (players[hash]) {
    sendTurning();
  }
}
