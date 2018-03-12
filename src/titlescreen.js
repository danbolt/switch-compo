var IntroSlide = function() {
};
IntroSlide.prototype.create = function() {
  this.game.camera.reset();

  var backgroundColor = this.game.add.graphics(0, 0);
  backgroundColor.beginFill(0x000000);
  backgroundColor.drawRect(0, 0, this.game.width, this.game.height);
  backgroundColor.generateTexture();

  var text = this.game.add.text(this.game.width / 2, this.game.height / 2, 'Team Jesse/Daniel', { fontWeight: 'bold', fill:'white', font:'18pt Arial', align: 'center' });
  text.anchor.set(0.5);
  text.alpha = 0;

  var t1 = this.game.add.tween(text);
  t1.to( {alpha: 1.0}, 1000, Phaser.Easing.Linear.None, false, 200);
  var t2 = this.game.add.tween(text);
  t2.to( {alpha: 0}, 900, Phaser.Easing.Linear.None, false, 3000);
  t1.chain(t2);
  t2.onComplete.add(function () {
    this.game.time.events.add(400, function () {
      this.game.state.start('TitleScreen');
    }, this);
  }, this);
  t1.start();
};

var TitleScreen = function() {
  this.fading = false;
};
TitleScreen.prototype.create = function() {
  this.game.camera.reset();

  var backgroundColor = this.game.add.graphics(0, 0);
  backgroundColor.beginFill(0x000000);
  backgroundColor.drawRect(0, 0, this.game.width, this.game.height);
  backgroundColor.generateTexture();

  var logo = this.game.add.image(this.game.width / 2, this.game.height / 3, 'logo');
  logo.anchor.set(0.5);
  logo.scale.set(0.85);
  logo.alpha = 0.01;

  var pressStart = this.game.add.bitmapText(this.game.width / 2, this.game.height / 4 * 3, 'font', 'Press any button to start.', 16);
  pressStart.align = 'center';
  pressStart.anchor.set(0.5);
  pressStart.visible = false;

  var t1 = this.game.add.tween(logo);
  t1.to( {alpha: 1.0}, 825, Phaser.Easing.Linear.None, false, 500);
  t1.onComplete.add(function () {
    this.game.time.events.add(200, function () {
      pressStart.visible = true;

      this.game.input.keyboard.callbackContext = this;
      this.game.input.keyboard.onUpCallback = this.startGame;
      this.game.input.gamepad.callbackContext = this;
      this.game.input.gamepad.onUpCallback = this.startGame;
    }, this);
  }, this);
  t1.start();
};
TitleScreen.prototype.startGame = function () {
  if (this.fading === true) {
    return;
  }

  sfx['enter'].play(undefined, undefined, 0.15);

  this.game.input.keyboard.callbackContext = null;
  this.game.input.keyboard.onUpCallback = null;
  this.game.input.gamepad.callbackContext = null;
  this.game.input.gamepad.onUpCallback = null;

  this.game.camera.onFadeComplete.add(function () {
    this.fading = false;
    this.game.state.start('Interstitial', true, false, '', 'first_room', 'north');
    this.game.camera.onFadeComplete.removeAll();
  }, this);
  this.fading = true;
  this.game.camera.fade(0x1e2d30, 2000, true);
};