var PlayerState = {
  MOVING : 0,
  KNOCKED_BACK : 1,
  DYING : 2,
  CHARGE : 3,
  ATTACK: 4,
  DASH: 5
};

var Player = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'jesseSheet1_32x64', 0);

  this.walkSpeed = 150;
  this.dashSpeed = 400;
  this.dashTime = 200;
  this.targetMoveSpeed = 220;

  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.anchor.set(0.5, 1);
  this.body.setSize(30, 32);
  this.body.offset.set(1, 32);

  this.currentState = PlayerState.MOVING;
  this.facingDirection = new Phaser.Point(0.0, 1.0);

  this.targetPt = this.game.add.sprite(32, 32, 'jesseSheet1_32x32', 27);
  this.targetPt.tint = 0xFF4466;
  this.targetPt.anchor.set(0.5, 0.5);
  this.targetPt.update = function() {
    this.rotation += this.game.time.elapsed * 2;
  }
  this.game.physics.enable(this.targetPt, Phaser.Physics.ARCADE);
  this.targetPt.kill();

  // charge logic
  this.game.input.keyboard.addKey(Phaser.KeyCode.X).onDown.add(function () {
    if (this.currentState === PlayerState.MOVING) {
      this.currentState = PlayerState.CHARGE;
      this.body.velocity.set(0);

      this.targetPt.x = this.x;
      this.targetPt.y = this.y;
      this.targetPt.revive();
    }
  }, this);
  this.game.input.keyboard.addKey(Phaser.KeyCode.X).onUp.add(function () {
    if (this.currentState === PlayerState.CHARGE) {
      this.currentState = PlayerState.MOVING;

      this.targetPt.body.velocity.set(0);
      this.targetPt.kill();
    }
  }, this);

  // dash logic
  this.game.input.keyboard.addKey(Phaser.KeyCode.C).onDown.add(function () {
    if (this.currentState === PlayerState.MOVING) {
      this.currentState = PlayerState.DASH;
      this.body.velocity.set(this.facingDirection.x * this.dashSpeed, this.facingDirection.y * this.dashSpeed);

      this.game.time.events.add(this.dashTime, function () {
        this.currentState = PlayerState.MOVING;
        this.body.velocity.set(0);
      }, this);
    }
  }, this);
};
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function() {

  // Used to get the directions of the directional input.
  var inputX = 0.0;
  var inputY = 0.0;
  if (this.game.input.keyboard.isDown(Phaser.KeyCode.RIGHT)) {
    inputX = 1.0;
  } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.LEFT)) {
    inputX = -1.0;
  }
  if (this.game.input.keyboard.isDown(Phaser.KeyCode.DOWN)) {
    inputY = 1.0;
  } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.UP)) {
    inputY = -1.0;
  }

  if (Math.abs(inputX) > 0.01 || Math.abs(inputY) > 0.01) {
    this.facingDirection.set(inputX, inputY);
    this.facingDirection.normalize();
  }

  if (this.currentState === PlayerState.MOVING) {
    this.body.velocity.set(this.walkSpeed * this.facingDirection.x, this.walkSpeed * this.facingDirection.y);
  } else if (this.currentState === PlayerState.CHARGE) {
    this.targetPt.body.velocity.set(this.targetMoveSpeed * this.facingDirection.x, this.targetMoveSpeed * this.facingDirection.y);
  }
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
  
  this.game.add.bitmapText(32, 32, 'font', 'snap maze!', 8);
};
Gameplay.prototype.update = function() {
  this.game.physics.arcade.collide(this.player, this.foreground);
  this.game.physics.arcade.collide(this.player.targetPt, this.foreground);
};
Gameplay.prototype.shutdown = function() {
  this.player = null;
  this.map = null;
  this.foreground = null;
  this.background = null;
};