var Player = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'jesseSheet1', 0);

  this.walkSpeed = 150;

  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(30, 32);
  this.body.offset.set(1, 32);
};
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function() {
  var walkX = 0.0;
  var walkY = 0.0;

  if (this.game.input.keyboard.isDown(Phaser.KeyCode.RIGHT)) {
    walkX = 1.0;
  } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.LEFT)) {
    walkX = -1.0;
  }

  if (this.game.input.keyboard.isDown(Phaser.KeyCode.DOWN)) {
    walkY = 1.0;
  } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.UP)) {
    walkY = -1.0;
  }

  this.body.velocity.set(this.walkSpeed * walkX, this.walkSpeed * walkY);
};

var Gameplay = function () {
  this.player = null;
  this.map = null;
  this.foreground = null;
  this.background = null;
};
Gameplay.prototype.create = function() {
  // create map
  this.map = this.game.add.tilemap('level1');
  this.map.addTilesetImage('set1', 'jesseSheet1_tile');
  this.background = this.map.createLayer('Background');
  this.foreground = this.map.createLayer('Foreground');
  this.foreground.resizeWorld();
  this.map.setCollisionByExclusion([0], true, this.foreground);
  this.game.physics.enable(this.foreground, Phaser.Physics.ARCADE);

  this.player = this.game.add.existing(new Player(this.game, 100, 100));
  
  this.game.add.bitmapText(32, 32, 'font', 'transform!', 8);
};
Gameplay.prototype.update = function() {
  this.game.physics.arcade.collide(this.player, this.foreground);
};
Gameplay.prototype.shutdown = function() {
  this.player = null;
  this.map = null;
  this.foreground = null;
  this.background = null;
};