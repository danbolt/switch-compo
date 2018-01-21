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
  this.highForeground = this.map.createLayer('HighForeground');
  this.foreground.resizeWorld();
  this.map.setCollisionByExclusion([0], true, this.foreground);
  this.map.setCollisionByExclusion([0], true, this.highForeground);
  this.game.physics.enable(this.foreground, Phaser.Physics.ARCADE);

  // get path nodes
  this.nodeMap = {};
  this.map.objects.pathNodes.forEach(function(node) {
    this.nodeMap[node.name] = node;
  }, this);

  this.background.renderable = false;
  this.foreground.renderable = false;
  this.highForeground.renderable = false;

  this.player = this.game.add.existing(new Player(this.game, 128, 128));
  this.player.renderable = false;
  this.player.targetPt.renderable = false;

  this.player.events.onKilled.add(function () {
    this.game.time.events.add(2000, function () {
      this.game.state.start('Gameplay');
    }, this);
  }, this);

  this.wolves = this.game.add.group();

  this.map.objects.wolves.forEach(function (wolfData) {
    var wolf = this.game.add.existing(new Wolf(this.game, wolfData.x, wolfData.y, this.player, wolfData.properties.patrolPath, this.nodeMap, this.map, this.foreground, this.highForeground));
    this.wolves.addChild(wolf);
    this.wolves.addToHash(wolf);
    wolf.revive();
    wolf.renderable = false;
  }, this);
  
  this.game.add.bitmapText(32, 32, 'font', 'scene 3', 8);

  setupThreeScene(this.game, this.player, this.wolves);
  GameplayCameraAngle = 0;
};
Gameplay.prototype.update = function() {
  this.game.physics.arcade.collide(this.player, this.foreground);
  this.game.physics.arcade.collide(this.wolves, this.foreground);

  this.game.physics.arcade.overlap(this.player, this.wolves, function (player, wolf) {
    player.kill();
  }, undefined, this);

  if (this.player.currentState === PlayerState.ATTACK) {
    this.game.physics.arcade.overlap(this.player.targetPt, this.wolves, function (targetPt, wolf) {
      wolf.confuse();
    }, undefined, this);

    this.wolves.forEachAlive(function (wolf) {
      if (wolf.position.distance(this.player.targetPt.position) < this.player.targetPt.data.soundRange) {
        wolf.noticePoint(this.player.targetPt.position);
      }
    }, this);
  }

  UpdateThreeScene(this.player, this. wolves);
};
Gameplay.prototype.preRender = function () {
  ThreeRenderer.render(ThreeScene, ThreeCamera);
};
Gameplay.prototype.shutdown = function() {
  UnloadThreeScene(this.wolves);

  this.player = null;
  this.wolves = null;
  this.map = null;
  this.foreground = null;
  this.background = null;
};
