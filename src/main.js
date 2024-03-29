var HQ_AUDIO = false;
var bgms = { outdoors: null, indoors: null, currentlyPlaying: null };
var sfx = {};

var hl2GodMode = false;

var usingGamepad = false;

var loadingText = 'Loading';

var BootstrapLoad = function () {
  //
};
BootstrapLoad.prototype.init = function () {
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
BootstrapLoad.prototype.preload = function () {
  // Font is Newsgeek by VØID
  // https://arcade.itch.io/newsgeek
  this.game.load.bitmapFont('font', 'asset/font/newsgeek.png', 'asset/font/newsgeek.json');
}
BootstrapLoad.prototype.create = function () {
  var loadingText = this.game.add.bitmapText(125.5, this.game.height / 2, 'font', loadingText, 16);
  loadingText.align = 'left';
  loadingText.anchor.set(0);

  var loadText = this.game.state.start('Preload', false, false);
};

var Preload = function () {
	this.lastNow = 0;
  this.numberOfPeriods = 0;
};
Preload.prototype.init = function() {
  this.lastNow = this.game.time.now;
  this.numberOfPeriods = 0;
};
Preload.prototype.loadUpdate = function () {
  if (this.game.time.now - this.lastNow > 400 + (50 * this.numberOfPeriods)) {
    this.lastNow = this.game.time.now;
    this.numberOfPeriods = (this.numberOfPeriods + 1) % 4;
    this.game.world.children[0].text = loadingText + (function (n) { var out = ''; for (var i = 0; i < n; i++) { out = out + '.'; }; return out; })(this.numberOfPeriods);
  }
}
Preload.prototype.preload = function() {
  this.game.load.spritesheet('jesseSheet1_32x64', 'asset/img/finalrenderfordaniel1.png', 32, 64);
  this.game.load.spritesheet('jesseSheet1_32x32', 'asset/img/finalrenderfordaniel1.png', 32, 32);

  this.game.load.image('jesseSheet1_tile', 'asset/img/finalrenderfordaniel1.png');
  this.game.load.image('logo', 'asset/img/logo.png');

  this.game.load.audio('psi_hover', 'asset/sfx/psi_hover.wav');
  this.game.load.audio('psi_shatter0', 'asset/sfx/psi_shatter0.wav');
  this.game.load.audio('psi_shatter1', 'asset/sfx/psi_shatter1.wav');
  this.game.load.audio('psi_shatter2', 'asset/sfx/psi_shatter2.wav');
  this.game.load.audio('crouch0', 'asset/sfx/crouch0.wav');
  this.game.load.audio('crouch1', 'asset/sfx/crouch1.wav');
  this.game.load.audio('crouch2', 'asset/sfx/crouch2.wav');
  this.game.load.audio('grunt0', 'asset/sfx/grunt0.wav');
  this.game.load.audio('grunt1', 'asset/sfx/grunt1.wav');
  this.game.load.audio('growl0', 'asset/sfx/growl0.wav');
  this.game.load.audio('growl1', 'asset/sfx/growl1.wav');
  this.game.load.audio('growl2', 'asset/sfx/growl2.wav');
  this.game.load.audio('growl3', 'asset/sfx/growl3.wav');
  this.game.load.audio('respawn', 'asset/sfx/respawn.wav');
  this.game.load.audio('died0', 'asset/sfx/died0.wav');
  this.game.load.audio('died1', 'asset/sfx/died1.wav');
  this.game.load.audio('died2', 'asset/sfx/died2.wav');
  this.game.load.audio('died3', 'asset/sfx/died3.wav');
  this.game.load.audio('burning', 'asset/sfx/burning.wav');
  this.game.load.audio('enter', 'asset/sfx/enter.wav');
  this.game.load.audio('back', 'asset/sfx/back.wav');

  if (HQ_AUDIO) {
    this.game.load.audio('outdoors', ['asset/bgm/wind_bgm.ogg']);
    this.game.load.audio('indoors', ['asset/bgm/cave_bgm.ogg']);
    this.game.load.audio('ambient', ['asset/bgm/ambient_bgm.ogg']);
  } else {
    this.game.load.audio('outdoors', ['asset/bgm/wind_bgm_lq.ogg', 'asset/bgm/wind_bgm_lq.mp3']);
    this.game.load.audio('indoors', ['asset/bgm/cave_bgm_lq.ogg', 'asset/bgm/cave_bgm_lq.mp3']);
    this.game.load.audio('ambient', ['asset/bgm/ambient_bgm_lq.ogg', 'asset/bgm/ambient_bgm_lq.mp3']);
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
  bgms.burning = this.game.add.audio('burning');
  bgms.ambient = this.game.add.audio('ambient');

  sfx['psi_hover'] = this.game.add.audio('psi_hover');
  sfx['psi_shatter0'] = this.game.add.audio('psi_shatter0');
  sfx['psi_shatter1'] = this.game.add.audio('psi_shatter1');
  sfx['psi_shatter2'] = this.game.add.audio('psi_shatter2');
  sfx['crouch0'] = this.game.add.audio('crouch0');
  sfx['crouch1'] = this.game.add.audio('crouch1');
  sfx['crouch2'] = this.game.add.audio('crouch2');
  sfx['grunt0'] = this.game.add.audio('grunt0');
  sfx['grunt1'] = this.game.add.audio('grunt1');
  sfx['growl0'] = this.game.add.audio('growl0');
  sfx['growl1'] = this.game.add.audio('growl1');
  sfx['growl2'] = this.game.add.audio('growl2');
  sfx['growl3'] = this.game.add.audio('growl3');
  sfx['respawn'] = this.game.add.audio('respawn');
  sfx['died0'] = this.game.add.audio('died0');
  sfx['died1'] = this.game.add.audio('died1');
  sfx['died2'] = this.game.add.audio('died2');
  sfx['died3'] = this.game.add.audio('died3');
  sfx['enter'] = this.game.add.audio('enter');
  sfx['back'] = this.game.add.audio('back');

  // move this to loader later
  loadThreeTextures();
};
Preload.prototype.update = function () {
  if (TilesTexture !== null && TreesTexture !== null && CharactersTexture !== null) {
    this.game.state.start('PickLang');
  }
};


var main = function () {
	console.log('hello, jam! ✌✨✨❤️');

  setupThree();

	var game = new Phaser.Game(320, 240, Phaser.WEBGL, undefined, undefined, true);
  game.state.add('BootstrapLoad', BootstrapLoad, false);
	game.state.add('Preload', Preload, false);
  game.state.add('Interstitial', Interstitial, false);
  game.state.add('TitleScreen', TitleScreen, false);
  game.state.add('Credits', Credits, false);
  game.state.add('IntroSlide', IntroSlide, false);
  game.state.add('PickLang', PickLang, false);
  game.state.add('Gameplay', Gameplay, false);

	game.state.start('BootstrapLoad');
};
