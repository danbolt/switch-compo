var Preload = function () {
	//
};
Preload.prototype.init = function() {
  this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  this.game.scale.refresh();

  this.game.scale.pageAlignHorizontally = true;
  this.game.scale.pageAlignVertically = true;

  // enable crisp rendering
  this.game.stage.smoothed = false;
  this.game.renderer.renderSession.roundPixels = true;  
  Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
  PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST; //for WebGL

  this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.DOWN);
  this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.UP);
  this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);

  this.game.input.gamepad.start();
};
Preload.prototype.preload = function() {
  // Font is Gamegirl Classic by freakyfonts
  // License is for noncommercial use
  // http://www.fontspace.com/freaky-fonts/gamegirl-classic
  this.game.load.bitmapFont('font', 'asset/font/font.png', 'asset/font/font.json');

  this.game.load.spritesheet('jesseSheet1_32x64', 'asset/img/finalrenderfordaniel1.png', 32, 64);
  this.game.load.spritesheet('jesseSheet1_32x32', 'asset/img/finalrenderfordaniel1.png', 32, 32);

  this.game.load.spritesheet('jesseSheet1_tile', 'asset/img/finalrenderfordaniel1.png');
  this.game.load.tilemap('level1', 'asset/map/map1.json', undefined, Phaser.Tilemap.TILED_JSON);
};
Preload.prototype.create = function() {
  this.game.state.start('Gameplay');

  this.game.scale.onSizeChange.add(function () {
    var cv = this.game.canvas;
    this.game.canvas = ThreeJSCanvas;
    this.game.scale.reflowCanvas();
    this.game.canvas = cv;
  }, this);

  var cv = this.game.canvas;
  this.game.canvas = ThreeJSCanvas;
  this.game.scale.reflowCanvas();
  this.game.canvas = cv;
};



var main = function () {
	console.log('hello, jam! 😊');

  setupThree();

	var game = new Phaser.Game(320, 240, Phaser.WEBGL, undefined, undefined, true);
	game.state.add('Preload', Preload, false);
  game.state.add('Gameplay', Gameplay, false);

	game.state.start('Preload');
};