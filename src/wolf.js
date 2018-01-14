var WolfState = {
  IDLE: 0,
  ALERT: 1,
  LEAPING: 2,
  CONFUSED: 3,
  RETURNING: 4,
  DYING: 5
};

var Wolf = function (game, x, y, player) {
  Phaser.Sprite.call(this, game, x, y, 'jesseSheet1_32x64', 0);

  this.tint = 0xFF0000;

  this.facing = 0.0;

  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.anchor.set(0.5, 1);
  this.body.setSize(30, 32);
  this.body.offset.set(1, 32);

  this.player = player;

  this.kill();

  this.events.onRevived.add(function () {
    //
  }, this);


  this.events.onKilled.add(function() {
    console.log('died!');
    this.data.threeSprite.visible = false;
  }, this);
};
Wolf.prototype = Object.create(Phaser.Sprite.prototype);
Wolf.prototype.constructor = Wolf;
Wolf.prototype.update = function () {

  // DEBUG
  var theta = this.position.angle(this.player.position);
  this.facing = theta;

  // adjust for camera
  theta = theta - GameplayCameraAngle - Math.PI * 0.5;
  if (theta > Math.PI) { theta -= Math.PI * 2; }
  if (theta < -Math.PI) { theta += Math.PI * 2; }

  if (theta >= Math.PI * 0.25 && theta <= Math.PI * 0.75) {
    this.frame = 0;
    this.data.threeSprite.scale.x = 32;
  } else if (Math.abs(theta) > Math.PI * 0.75) {
    this.frame = 2;
    this.data.threeSprite.scale.x = 32;
  } else if (Math.abs(theta) < Math.PI * 0.25) {
    this.frame = 2;
    this.data.threeSprite.scale.x = -32;
  } else if (theta <= Math.PI * -0.25 && theta > Math.PI * -0.75) {
    this.frame = 1;
    this.data.threeSprite.scale.x = 32;
  }
};