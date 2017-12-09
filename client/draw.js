//This is where we're putting the draw loop

const redraw = (time) => {
  //Call update
  update();

  //turn off filter
  ctx.filter = "none";

  //clear screen
  ctx.clearRect(0, 0, screen.width, screen.height);

  //Draw background
  ctx.drawImage(oceanBGImg, 0, 0, 1920, 1080, 0, 0, canvas.width, canvas.height);


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
      221, //Source Width 221 pixels
      81, //Source Height 81 pixels
      -221 / 2, //Drawing at -221/2 because we translated canvas
      -81 / 2, //Drawing at -81/2 because we translated canvas
      221, //Draw Width
      81 //Draw Height
    );

    //To draw turrets should I not restore? until after all are drawn?

    //Draw Turrets   



    for (let j = 0; j < player.turrets.length; j++) {
      const turret = player.turrets[j];
      ctx.save();
      ctx.translate(turret.offsetX, turret.offsetY);
      ctx.rotate(turret.rotation * (Math.PI / 180));
      ctx.drawImage(
        shipTurretLargeImg,
        0,
        0,
        20, //Source width
        25, //Source Height
        -20 / 2, -25 / 2,
        20,
        25,
      );
      //reset for next turret's offset and rotation
      ctx.restore();
    }
    ctx.restore();
  }


  //loop and draw all bullets
  let bulletKeys = Object.keys(bullets);
  for (let i = 0; i < bulletKeys.length; i++) {
    const bullet = bullets[bulletKeys[i]];

    //draw bullet
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(bullet.rotation * (Math.PI / 180));


    ctx.drawImage(
      bulletImg,
      0,
      0,
      20,
      10, -20 / 2, -10 / 2,
      20,
      10
    );

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

  //update all UI elements
  if (players[hash]) {

    roomUIText.textContent = `#${players[hash].room +1}`;

    //Update Gun status
    gunsUIText.textContent = `Ready to Fire!`;
    //Update Engine status

    let engineStatusText = '';
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
    enginesUIText.textContent = `${engineStatusText}`;
  } else {
    console.log("Don't have player yet.");
  }




  animationFrame = requestAnimationFrame(redraw);
}
