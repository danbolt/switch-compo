var Gameplay = function () {
  this.player = null;
  this.wolves = null;
  this.map = null;
  this.foreground = null;
  this.highForeground = null;
  this.background = null;
  this.mapKey = null;
  this.directionFrom = null;
  this.fading = false;
};
Gameplay.prototype.init = function (mapKey, directionFrom) {
  this.mapKey = mapKey;
  this.directionFrom = directionFrom;
};
Gameplay.prototype.preload = function() {
  this.game.load.tilemap(this.mapKey, 'asset/map/' + this.mapKey + '.json', undefined, Phaser.Tilemap.TILED_JSON);
};
Gameplay.prototype.create = function() {
  // When we load from an interstital, we don't destroy the world to make fading consistent in Phaser.
  // Once we've rendered though, we can get rid of everything.
  this.game.world.children.forEach(function (child) { child.destroy(); }, this);

  // create map
  this.map = this.game.add.tilemap(this.mapKey);
  this.map.addTilesetImage('set1', 'jesseSheet1_tile');
  this.background = this.map.createLayer('Background');
  this.foreground = this.map.createLayer('Foreground');
  this.highForeground = this.map.createLayer('HighForeground');
  this.foreground.resizeWorld();
  this.map.setCollisionByExclusion([0], true, this.foreground);
  this.map.setCollisionByExclusion([0], true, this.highForeground);
  this.game.physics.enable(this.foreground, Phaser.Physics.ARCADE);

  var navArray = this.foreground.layer.data.map(function (row) {
    return row.map(function(cell) {
      return cell.index === -1 ? 0 : 1;
    }, this);
  }, this);
  this.map.data = {};
  this.map.data.navGrid = new PF.Grid(navArray);
  this.map.data.navFinder = new PF.AStarFinder({
    allowDiagonal: true,
    dontCrossCorners: true,
    heuristic: PF.Heuristic.manhattan
  });

  this.background.renderable = false;
  this.foreground.renderable = false;
  this.highForeground.renderable = false;

  var entryPoint = this.map.objects.entry.find(function (ep) { return ep.name === this.directionFrom; }, this);
  this.player = this.game.add.existing(new Player(this.game, entryPoint ? entryPoint.x : 128, entryPoint ? entryPoint.y : 128));
  this.player.renderable = false;
  this.player.targetPt.renderable = false;
  this.player.facingDirection = this.directionFromToPlayerDirection(this.directionFrom);

  this.player.events.onKilled.add(function () {
    this.game.time.events.add(2000, function () {
      this.game.state.start('Gameplay', true, false, this.mapKey, this.directionFrom);
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
  
  this.game.add.bitmapText(32, 32, 'font', this.mapKey, 8);

  setupThreeScene(this.game, this.player, this.wolves);

  this.game.camera.flash(0x3a4d51, 700);
};
Gameplay.prototype.update = function() {
  this.game.physics.arcade.collide(this.player, this.foreground);
  //this.game.physics.arcade.collide(this.wolves, this.foreground);

  if (this.fading === false) {
    this.game.physics.arcade.overlap(this.player, this.wolves, function (player, wolf) {
      player.kill();
    }, undefined, this);
  }

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

  // update the three.js scene to match gameplay
  UpdateThreeScene(this.player, this. wolves);

  // transition to other maps
  if (this.fading === false) {
    var exit = undefined;
    var exitDirection = undefined;

    if (this.player.y < 32 && this.map.properties.northExit !== undefined) {
      exit = this.map.properties.northExit
      exitDirection = 'north';
    } else if (this.player.y > (this.map.heightInPixels - 32) && this.map.properties.southExit !== undefined) {
      exit = this.map.properties.southExit
      exitDirection = 'south';
    } else if (this.player.x < 32 && this.map.properties.westExit !== undefined) {
      exit = this.map.properties.westExit
      exitDirection = 'west';
    } else if (this.player.x > (this.map.widthInPixels - 32) && this.map.properties.eastExit !== undefined) {
      exit = this.map.properties.eastExit
      exitDirection = 'east';
    }

    if (exit !== undefined && exitDirection !== undefined) {
      this.game.camera.onFadeComplete.add(function () {
        this.fading = false;
        this.game.state.start('Interstitial', true, false, this.mapKey, exit, exitDirection);
        this.game.camera.onFadeComplete.removeAll();
      }, this);
      this.fading = true;
      this.game.camera.fade(0x3a4d51, 1000, true);
      this.player.update = function() {}; // quick/dirty hack to prevent player movement
    }
  }
};
Gameplay.prototype.preRender = function () {
  ThreeRenderer.render(ThreeScene, ThreeCamera);
};
Gameplay.prototype.directionFromToPlayerDirection  = function(directionFrom) {
  switch (directionFrom) {
    case 'east':
      return new Phaser.Point(1, 0);
    break;
    case 'south':
      return new Phaser.Point(0, 1);
    break;
    case 'west':
      return new Phaser.Point(-1, 0);
    break;
    case 'north':
      return new Phaser.Point(0, -1);
    break;
  }

  return new Phaser.Point(0, 1);
};
Gameplay.prototype.shutdown = function() {
  UnloadThreeScene(this.wolves);

  this.game.cache.removeTilemap(this.mapKey);

  this.player = null;
  this.wolves = null;
  this.map = null;
  this.foreground = null;
  this.highForeground = null;
  this.background = null;
  this.mapKey = null;
  this.directionFrom = null;
  this.fading = false;
};

var Interstitial = function () {
  this.mapKey = null;
  this.directionFrom = null;
};
Interstitial.prototype.init = function(prevMapKey, mapKey, directionFrom) {
  this.mapKey = mapKey;
  this.prevMapKey = prevMapKey;
  this.directionFrom = directionFrom;
}
Interstitial.prototype.create = function() {
  var backgroundColor = this.game.add.graphics(0, 0);
  backgroundColor.beginFill(0x3a4d51);
  backgroundColor.drawRect(0, 0, this.game.width, this.game.height);
  backgroundColor.generateTexture();

  if (TransitionTable[this.prevMapKey + this.mapKey] !== undefined) {
    var textToShow = this.game.add.bitmapText(this.game.width / 2, this.game.height / 2, 'font', TransitionTable[this.prevMapKey + this.mapKey], 8);
    textToShow.anchor.set(0.5);
    textToShow.align = 'center';
    textToShow.alpha = 0.0;

    var t1 = this.game.add.tween(textToShow);
    t1.to( {alpha : 1.0}, 1000, Phaser.Easing.Linear.None, false, 0);
    var t2 = this.game.add.tween(textToShow);
    t2.to( {alpha : 0.0}, 850, Phaser.Easing.Linear.None, false, 1000);
    t1.chain(t2);

    t2.onComplete.add(function () {
      this.game.time.events.add(150, function () {
        this.game.state.start('Gameplay', false, false, this.mapKey, this.directionFrom);
      }, this);
    }, this);

    t1.start();
  } else {
    this.game.time.events.add(150, function () {
      this.game.state.start('Gameplay', false, false, this.mapKey, this.directionFrom);
    }, this);
  }
};
Interstitial.prototype.shutdown = function () {
  this.mapKey = null;
  this.prevMapKey;
  this.directionFrom = null;
}
