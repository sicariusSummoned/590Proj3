//This is where we're putting the draw loop

const redraw = (time) => {
  //Call update
  update();

  //turn off filter
  ctx.filter = "none";

  //clear screen
  ctx.clearRect(0, 0, screen.width, screen.height);

  //Draw background
  ctx.drawImage(oceanBGImg, 0,0,1920,1080,0,0,canvas.width,canvas.height);


  //loop and draw all players and their turrets
  let playerKeys = Object.keys(players);
  for (let i = 0; i < playerKeys.length; i++) {
    const player = players[playerKeys[i]];

    //Draw Ship Hull
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation * (Math.PI / 180));
    ctx.drawImage(
      shipImg, // our source image
      0, //Source X
      0, //Source Y
      221, //Source Width 81 pixels
      81, //Source Height 221 pixels
      -221 / 2, //Drawing at -81/2 because we translated canvas
      -81 / 2, //Drawing at -221/2 because we translated canvas
      221, //Draw Width
      81 //Draw Height
    );
    ctx.restore();

    for (let j = 0; j < player.turrets.length; j++) {
      //Draw Turrets   

    }
  }

  //loop and draw all bullets
  let bulletKeys = Object.keys(bullets);
  for (let i = 0; i < bulletKeys.length; i++) {
    const bullet = bullets[bulletKeys[i]];

    //draw bullet
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(bullet.rotation * (Math.PI / 180));

    /**
    ctx.drawImage(
      bulletImg,
      
    );
    **/
    ctx.restore();
  }

  //loop and draw all explosions
  for (let i = 0; i < explosions.length; i++) {
    const explosion = explosions[i];
    
    //draw Explosion
    /**
    ctx.drawImage(
      explosionImg,
    );
    **/
  }


  animationFrame = requestAnimationFrame(redraw);
}
