var PickLang = function() {
};
PickLang.prototype.create = function() {

  this.game.camera.reset();

  var backgroundColor = this.game.add.graphics(0, 0);
  backgroundColor.beginFill(0x000000);
  backgroundColor.drawRect(0, 0, this.game.width, this.game.height);
  backgroundColor.generateTexture();

  var langs = [];
  var langIndicators = [];
  var currentLang = 0;
  Object.keys(LocTable).forEach(function (key, i, arr) {
    var localePack = LocTable[key];
    langs.push(key);

    var langText = this.game.add.bitmapText(this.game.width / 2, (this.game.height / 2 - (arr.length - 1) * 18 * 0.5) + (i * 16), 'font', '> ' + localePack['lang_name'] + ' <'  , 16);
    langText.align = 'center';
    langText.anchor.set(0.5);
    langText.maxWidth = 290;
    langIndicators.push(langText);
  }, this);

  var refreshLangs = function() {
    langIndicators.forEach(function (langBitmapText, i) {
      langBitmapText.children[0].renderable = i === currentLang;
      langBitmapText.children[langBitmapText.children.length - 1].renderable = i === currentLang;
      langBitmapText.tint = i === currentLang ? 0xFFFFFF : 0x999999;
    }, this);
  };
  var selectDown = function () {
    currentLang = (currentLang + 1) % langs.length;
    
    sfx['back'].play(undefined, undefined, 0.15);

    refreshLangs();
  };
  var selectUp = function () {
    currentLang = (currentLang - 1 + langs.length) % langs.length;
    
    sfx['back'].play(undefined, undefined, 0.15);

    refreshLangs();
  };
  var selectEnter = function () {
    currentLocale = langs[currentLang];

    sfx['enter'].play(undefined, undefined, 0.15);

    this.game.input.keyboard.onUpCallback = null;
    this.game.input.gamepad.onUpCallback = null;

    langIndicators.forEach(function (langBitmapText, i) {
      langBitmapText.children[0].renderable = i === currentLang;
      langBitmapText.children[langBitmapText.children.length - 1].renderable = i === currentLang;
      langBitmapText.tint = i === currentLang ? 0xFFFFFF : 0x000000;
    }, this);

    this.game.camera.onFadeComplete.add(function () {
      this.game.state.start('TitleScreen', true, false);
      this.game.camera.onFadeComplete.removeAll();
    }, this);
    this.game.camera.fade(0x000000, 700, true);
  };

  this.game.input.keyboard.callbackContext = this;
  this.game.input.keyboard.onUpCallback = function (key) {
    if (key.key === "ArrowDown") {
      selectDown.call(this);
    } else if (key.key === "ArrowUp") {
      selectUp.call(this);
    } else if (key.key === "Enter" || key.key === " ") {
      selectEnter.call(this);
    }
  };
  this.game.input.gamepad.callbackContext = this;
  this.game.input.gamepad.onUpCallback = function (button) {
    console.log(button);
  };

  refreshLangs();
};


var IntroSlide = function() {
};
IntroSlide.prototype.create = function() {
  this.game.camera.reset();

  var backgroundColor = this.game.add.graphics(0, 0);
  backgroundColor.beginFill(0x000000);
  backgroundColor.drawRect(0, 0, this.game.width, this.game.height);
  backgroundColor.generateTexture();

  var text = this.game.add.text(this.game.width / 2, this.game.height / 2, 'Flip Team', { fontWeight: 'bold', fill:'white', font:'18pt Arial', align: 'center' });
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

  var pressStart = this.game.add.bitmapText(this.game.width / 2, this.game.height / 4 * 3, 'font', loc('press_start'), 16);
  pressStart.align = 'center';
  pressStart.anchor.set(0.5);
  pressStart.visible = false;
  pressStart.maxWidth = 290;

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