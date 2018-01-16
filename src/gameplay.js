var Gameplay = function () {
  this.player = null;
  this.wolves = null;
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

  // get path nodes
  this.nodeMap = {};
  this.map.objects.pathNodes.forEach(function(node) {
    this.nodeMap[node.name] = node;
  }, this);

  this.background.renderable = false;
  this.foreground.renderable = false;

  this.player = this.game.add.existing(new Player(this.game, 100, 100));
  this.player.renderable = false;
  this.player.targetPt.renderable = false;

  this.wolves = this.game.add.group();

  this.map.objects.wolves.forEach(function (wolfData) {
    var wolf = this.game.add.existing(new Wolf(this.game, wolfData.x, wolfData.y, this.player, wolfData.properties.patrolPath, this.nodeMap));
    this.wolves.addChild(wolf);
    this.wolves.addToHash(wolf);
    wolf.revive();
    wolf.renderable = false;
  }, this);
  
  this.game.add.bitmapText(32, 32, 'font', 'scene 2', 8);

  setupThreeScene(this.game, this.player, this.wolves);
};
Gameplay.prototype.update = function() {
  this.game.physics.arcade.collide(this.player, this.foreground);
  this.game.physics.arcade.collide(this.wolves, this.foreground);

  this.game.physics.arcade.overlap(this.player, this.wolves, function (player, wolf) {
    player.kill();
  }, undefined, this);

  if (this.player.currentState === PlayerState.ATTACK) {
    this.game.physics.arcade.overlap(this.player.targetPt, this.wolves, function (target, wolf) {
      wolf.kill();
    }, undefined, this);
  }

  UpdateThreeScene(this.player, this. wolves);
};
Gameplay.prototype.preRender = function () {
  ThreeRenderer.render(ThreeScene, ThreeCamera);
};
Gameplay.prototype.shutdown = function() {
  this.player = null;
  this.wolves = null;
  this.map = null;
  this.foreground = null;
  this.background = null;
};
