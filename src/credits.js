var Credits = function () {
  this.creditsListing = [
    { title: "credit_title" },
    { title: "credit_art", who: "Jesse Taylor" },
    { title: "credit_production", who: "Daniel Savage" },
    { title: "credit_playtesting", who: ["Natasha Miner", "Dylan Shellenberg", "Rose-Lynne Savage", "Clark Allenby", "Wilson Chung", "Joel Stack"] },
    { title: "credit_dev_sup", who: "Jesse Taylor" },
    { title: "credit_audio", who: ["noiseforfun.com", "SocializedArtist45", "spookymodem", "TobiasKosmos", "Daniel Savage", "XxChr0nosxX", "Aleks41", "qubodup", "Erokia", "xDimebagx", "jorge0000"] },
    { title: "credit_loc", who: ["Alina Varela - Español"] },
    { title: "credit_ty", who: ["Byron Munsie", "Alina Varela", "Geoff Fisher", "Alyssa Savage", "Richard \"photonstorm\" Davey", "Mom and Dad"] },
    { title: "credit_link", click: "https://danbolt.itch.io" }
  ];

  this.creditsText = null;
};
Credits.prototype.create = function () {
  this.game.camera.reset();

  var backgroundColor = this.game.add.graphics(0, 0);
  backgroundColor.beginFill(0x000000);
  backgroundColor.drawRect(0, 0, this.game.width, this.game.height);
  backgroundColor.generateTexture();
  
  this.creditsText = this.game.add.bitmapText(this.game.width / 2, this.game.height / 2, 'font', 'credit', 16);
  this.creditsText.anchor.set(0.5);
  this.creditsText.align = 'center';

  this.creditsText.alpha = 0;

  var tickCredit = function (ind) {
    var credit = this.creditsListing[ind];

    this.creditsText.text = loc(credit.title);
    if (typeof(credit.who) === 'string') {
        this.creditsText.text += '\n\n' + credit.who;
    } else if (credit.who === undefined) {
      // do nothing
    } else if (credit.who.constructor === Array) {
      this.creditsText.text += '\n';
      for (var i = 0; i < credit.who.length; i++) {
        this.creditsText.text += '\n' + credit.who[i];
      }
    }

    if (credit.click !== undefined && typeof(credit.click) === 'string') {
      this.creditsText.inputEnabled = true;
      this.creditsText.input.useHandCursor = true;
      this.creditsText.events.onInputDown.add(function () {
        var win = window.open(credit.click, '_blank');
        win.focus();
      }, this);
    } else {
      this.creditsText.inputEnabled = false;
    }

    var t1 = this.game.add.tween(this.creditsText);
    t1.to({ alpha: 1 }, 600);
    var t2 = this.game.add.tween(this.creditsText);
    t2.to({ alpha: 0 }, 600, Phaser.Easing.Linear.None, undefined, 1500 + (credit.who && credit.who.constructor === Array ? 300 * credit.who.length : 0));
    t1.chain(t2);
    t2.onComplete.add(function () {
      if (ind + 1 < this.creditsListing.length) {
        this.game.time.events.add(300, tickCredit, this, ind + 1);
      } else {
        this.game.time.events.add(850, function () {
          this.game.state.start('TitleScreen');
        }, this);
      }
    }, this);
    t1.start();
  };

  this.game.time.events.add(300, tickCredit, this, 0);
};
Credits.prototype.shutdown = function () {
  this.creditsText = null;
};