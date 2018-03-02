var HQ_AUDIO = false;
var bgms = { outdoors: null, indoors: null, currentlyPlaying: null };
var sfx = {};

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
  this.game.load.bitmapFont('font', 'asset/font/newsgeek.png', 'asset/font/newsgeek.json');

  this.game.load.spritesheet('jesseSheet1_32x64', 'asset/img/finalrenderfordaniel1.png', 32, 64);
  this.game.load.spritesheet('jesseSheet1_32x32', 'asset/img/finalrenderfordaniel1.png', 32, 32);

  this.game.load.image('jesseSheet1_tile', 'asset/img/finalrenderfordaniel1.png');

  this.game.load.audio('psi_hover', 'asset/sfx/psi_hover.wav');
  this.game.load.audio('psi_shatter0', 'asset/sfx/psi_shatter0.wav');
  this.game.load.audio('psi_shatter1', 'asset/sfx/psi_shatter1.wav');
  this.game.load.audio('psi_shatter2', 'asset/sfx/psi_shatter2.wav');
  this.game.load.audio('crouch0', 'asset/sfx/crouch0.wav');
  this.game.load.audio('crouch1', 'asset/sfx/crouch1.wav');
  this.game.load.audio('crouch2', 'asset/sfx/crouch2.wav');

  if (HQ_AUDIO) {
    this.game.load.audio('outdoors', ['asset/bgm/wind_bgm.ogg']);
    this.game.load.audio('indoors', ['asset/bgm/cave_bgm.ogg']);
  } else {
    this.game.load.audio('outdoors', ['asset/bgm/wind_bgm_lq.ogg', 'asset/bgm/wind_bgm_lq.mp3']);
    this.game.load.audio('indoors', ['asset/bgm/cave_bgm_lq.ogg', 'asset/bgm/cave_bgm_lq.mp3']);
  }
};
Preload.prototype.create = function() {
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

  bgms.outdoors = this.game.add.audio('outdoors');
  bgms.indoors = this.game.add.audio('indoors');

  sfx['psi_hover'] = this.game.add.audio('psi_hover');
  sfx['psi_shatter0'] = this.game.add.audio('psi_shatter0');
  sfx['psi_shatter1'] = this.game.add.audio('psi_shatter1');
  sfx['psi_shatter2'] = this.game.add.audio('psi_shatter2');
  sfx['crouch0'] = this.game.add.audio('crouch0');
  sfx['crouch1'] = this.game.add.audio('crouch1');
  sfx['crouch2'] = this.game.add.audio('crouch2');

  // move this to loader later
  loadThreeTextures();
};
Preload.prototype.update = function () {
  if (TilesTexture !== null && TreesTexture !== null && CharactersTexture !== null) {
    this.game.state.start('Gameplay', true, false, 'first_room', 'north');
  }
};


var main = function () {
	console.log('hello, jam! ✌✨✨❤️');

  setupThree();

	var game = new Phaser.Game(320, 240, Phaser.WEBGL, undefined, undefined, true);
	game.state.add('Preload', Preload, false);
  game.state.add('Interstitial', Interstitial, false);
  game.state.add('Gameplay', Gameplay, false);

	game.state.start('Preload');
};
