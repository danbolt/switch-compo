var TitleScreen = function() {
  this.fading = false;
};
TitleScreen.prototype.create = function() {
  this.game.camera.reset();

  var backgroundColor = this.game.add.graphics(0, 0);
  backgroundColor.beginFill(0x000000);
  backgroundColor.drawRect(0, 0, this.game.width, this.game.height);
  backgroundColor.generateTexture();

  var logo = this.game.add.bitmapText(this.game.width / 2, this.game.height / 3, 'font', '(logo)', 16);
  logo.align = 'center';
  logo.anchor.set(0.5);

  var pressStart = this.game.add.bitmapText(this.game.width / 2, this.game.height / 3 * 2, 'font', 'Press any button to start.', 16);
  pressStart.align = 'center';
  pressStart.anchor.set(0.5);

  this.game.input.keyboard.callbackContext = this;
  this.game.input.keyboard.onDownCallback = this.startGame;
  this.game.input.gamepad.callbackContext = this;
  this.game.input.gamepad.onDownCallback = this.startGame;
};
TitleScreen.prototype.startGame = function () {
  if (this.fading === true) {
    return;
  }

  sfx['enter'].play(undefined, undefined, 0.7);

  this.game.input.keyboard.callbackContext = null;
  this.game.input.keyboard.onDownCallback = null;
  this.game.input.gamepad.callbackContext = null;
  this.game.input.gamepad.onDownCallback = null;

  this.game.camera.onFadeComplete.add(function () {
    this.fading = false;
    this.game.state.start('Interstitial', true, false, '', 'first_room', 'north');
    this.game.camera.onFadeComplete.removeAll();
  }, this);
  this.fading = true;
  this.game.camera.fade(0x1e2d30, 2000, true);
};