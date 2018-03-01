var PlayerState = {
  MOVING : 0,
  KNOCKED_BACK : 1,
  DYING : 2,
  CHARGE : 3,
  ATTACK: 4,
  DASH: 5
};

var Player = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'jesseSheet1_32x64', 0);

  this.animations.add('run_right', [2, 10, 18, 26], 8, true);
  this.animations.add('run_down', [8, 0, 16, 0], 8, true);
  this.animations.add('run_left', [2, 10, 18, 26], 8, true);
  this.animations.add('run_up', [9, 1, 17, 1], 8, true);
  this.animations.add('idle_right', [2], 8, true);
  this.animations.add('idle_down', [0], 8, true);
  this.animations.add('idle_left', [2], 8, true);
  this.animations.add('idle_up', [1], 8, true);
  this.animations.add('idle_right_focus', [25], 8, true);
  this.animations.add('idle_down_focus', [24], 8, true);
  this.animations.add('idle_left_focus', [25], 8, true);
  this.animations.add('idle_up_focus', [1], 8, true);
  this.animations.add('crouch', [3], 8, true);
  this.animations.add('crouch_focus', [4], 8, true);

  this.walkSpeed = 150;
  this.dashSpeed = 400;
  this.dashTime = 200;
  this.targetMoveSpeed = 220;
  this.attackDuration = 250;
  this.maxTargetDistance = 32 * 8;
  this.cameraMoveSpeed = 0.0025;

  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.anchor.set(0.5, 0.5);
  this.body.setSize(30, 32);
  this.body.offset.set(1, 32);

  this.currentState = PlayerState.MOVING;
  this.facingDirection = new Phaser.Point(0.0, 1.0);
  this.isCrouching = false;
  this.gamepadAxis = new Phaser.Point(0, 0);
  this.gamepadAxisCStick = new Phaser.Point(0, 0);

  this.events.onKilled.add(function() {
    this.frame = 19;
  }, this);

  this.events.onKilled.add(function() {
    this.data.bloods.forEach(function (bloodSprite, i, a) {
      bloodSprite.position.set(this.x, 24, this.y);
      bloodSprite.scale.set(0.7 + 0.2 * Math.random(), 0.7 + 0.2 * Math.random(), 1.0);

      if (i === 0) {
        bloodSprite.position.y = 17;

        var ts = this.game.add.tween(bloodSprite.scale);
        ts.to({ x: 4, y: 4, z:4}, 200, Phaser.Easing.Cubic.Out);
        ts.start();
      } else {
        var l = (64 +  12 * Math.random())
        var tp = this.game.add.tween(bloodSprite.position);
        tp.to({ x: this.x + (l * Math.cos(i / (a.length-1) * Math.PI * 2 + 0.41 * Math.random())), y: [21, 17 + i*0.8], z: this.y + (l * Math.sin(i / (a.length-1) * Math.PI * 2 + 0.41 * Math.random())) }, 300, Phaser.Easing.Cubic.Out);
        tp.start();
        
        var ts = this.game.add.tween(bloodSprite.scale);
        var rs = ~~(2 * Math.random())
        ts.to({ x: 0.8 + rs, y: 0.8 + rs}, 200, Phaser.Easing.Cubic.Out);
        ts.start();
      }
      
    }, this);
  }, this);

  this.targetPt = this.game.add.sprite(32, 32, 'jesseSheet1_32x32', 27);
  this.targetPt.data.soundRange = 185;
  this.targetPt.data.radius = 48;
  this.targetPt.tint = 0xFF4466;
  this.targetPt.anchor.set(0.5, 0.5);
  this.targetPt.update = function() {
    this.rotation += this.game.time.elapsed * 0.01;
  }
  this.game.physics.enable(this.targetPt, Phaser.Physics.ARCADE);
  this.targetPt.body.setSize(this.targetPt.data.radius, this.targetPt.data.radius);
  this.targetPt.kill();
  this.returnTargetTween = null;

  var backing = this.game.add.sprite(0, 0, 'jesseSheet1_32x32', 21);
  backing.tint = 0x111111;
  backing.fixedToCamera = true;
  this.timerSprite = this.game.add.sprite(0, 0, 'jesseSheet1_32x32', 21);
  this.timerSprite.fixedToCamera = true;
  this.stamina = 1.0;
  this.punishRecharging = false;

  var chargeDownCallback = function () {
    if (this.alive && this.currentState === PlayerState.MOVING && this.stamina > 0 && this.punishRecharging === false) {
      this.stamina -= 0.6;
      if (this.stamina < 0) {
        this.punishRecharging = true;
      }

      this.currentState = PlayerState.CHARGE;
      this.body.velocity.set(0);

      this.targetPt.x = this.x;
      this.targetPt.y = this.y;
      this.targetPt.revive();

      if (GameplayFovChangeTween !== null) {
        GameplayFovChangeTween.stop();
        GameplayFovChangeTween = null;
      }

      if (this.returnTargetTween !== null) {
        this.returnTargetTween.stop();
        this.returnTargetTween = null;
      }

      GameplayFovChangeTween = this.game.add.tween(GameplayCameraData);
      GameplayFovChangeTween.to( { fov: GameplayPSIFov, zDist: 120, yDist: 340 }, 1000, Phaser.Easing.Linear.None);
      GameplayFovChangeTween.onUpdateCallback(function (tween, value, data) {
        ThreeCamera.fov = GameplayCameraData.fov;
        ThreeCamera.updateProjectionMatrix();
      }, this);
      GameplayFovChangeTween.start();
    }
  };
  var chargeUpCallback = function () {
    if (this.currentState === PlayerState.CHARGE) {
      this.currentState = PlayerState.ATTACK;
      this.targetPt.body.velocity.set(0);

      this.targetPt.tint = 0xFFFF00;

      this.game.time.events.add(this.attackDuration, function () {
        this.targetPt.kill();
        this.targetPt.tint = 0xFF4466;

        this.currentState = PlayerState.MOVING;
      }, this);

      this.returnTargetTween = this.game.add.tween(this.targetPt);
      this.targetPt.moves = false;
      this.returnTargetTween.to({x: this.x, y: this.y}, 700, Phaser.Easing.Linear.None);
      this.returnTargetTween.onComplete.add(function () {
        this.returnTargetTween = null;
      }, this);
      this.returnTargetTween.start();

      if (GameplayFovChangeTween !== null) {
        GameplayFovChangeTween.stop();
        GameplayFovChangeTween = null;
      }

      GameplayFovChangeTween = this.game.add.tween(GameplayCameraData);
      GameplayFovChangeTween.to( { fov: GameplayWalkingFov, zDist: 250, yDist: 200 }, 750, Phaser.Easing.Cubic.InOut);
      GameplayFovChangeTween.onUpdateCallback(function (tween, value, data) {
        ThreeCamera.fov = GameplayCameraData.fov;
        ThreeCamera.updateProjectionMatrix();
      }, this);
      GameplayFovChangeTween.start();
    }
  };
  var crouchDownCallback = function () {
    if (GameplayFovChangeTween !== null) {
      GameplayFovChangeTween.stop();
      GameplayFovChangeTween = null;
    }

    GameplayFovChangeTween = this.game.add.tween(GameplayCameraData);
    GameplayFovChangeTween.to( { fov: GameplayCrouchingFov, zDist: 300, yDist: 120 }, 500, Phaser.Easing.Cubic.InOut);
    GameplayFovChangeTween.onUpdateCallback(function (tween, value, data) {
      ThreeCamera.fov = GameplayCameraData.fov;
      ThreeCamera.updateProjectionMatrix();
    }, this);
    GameplayFovChangeTween.start();
  };
  var crouchUpCallback = function () {
    if (GameplayFovChangeTween !== null) {
      GameplayFovChangeTween.stop();
      GameplayFovChangeTween = null;
    }

    GameplayFovChangeTween = this.game.add.tween(GameplayCameraData);
    GameplayFovChangeTween.to( { fov: GameplayWalkingFov, zDist: 250, yDist: 200 }, 500, Phaser.Easing.Cubic.InOut);
    GameplayFovChangeTween.onUpdateCallback(function (tween, value, data) {
      ThreeCamera.fov = GameplayCameraData.fov;
      ThreeCamera.updateProjectionMatrix();
    }, this);
    GameplayFovChangeTween.start();
  };

  // charge logic
  this.game.input.keyboard.addKey(Phaser.KeyCode.N).onDown.add(chargeDownCallback, this);
  this.game.input.keyboard.addKey(Phaser.KeyCode.N).onUp.add(chargeUpCallback, this);
  this.game.input.keyboard.addKey(Phaser.KeyCode.M).onDown.add(crouchDownCallback, this);
  this.game.input.keyboard.addKey(Phaser.KeyCode.M).onUp.add(crouchUpCallback, this);

  this.game.input.gamepad.callbackContext = this;
  this.game.input.gamepad.onDownCallback = function (buttonCode) {
    if (buttonCode === Phaser.Gamepad.XBOX360_A) {
      chargeDownCallback.call(this);
    } else if (buttonCode === Phaser.Gamepad.XBOX360_B) {
      crouchDownCallback.call(this);
    }
  };
  this.game.input.gamepad.onUpCallback = function (buttonCode) {
    if (buttonCode === Phaser.Gamepad.XBOX360_A) {
      chargeUpCallback.call(this);
    } else if (buttonCode === Phaser.Gamepad.XBOX360_B) {
      crouchUpCallback.call(this);
    }
  };
  this.game.input.gamepad.onAxisCallback = function (pad, padIndex) {
    this.gamepadAxis.x = pad.axis(0) ? pad.axis(0) : 0;
    this.gamepadAxis.y = pad.axis(1) ? pad.axis(1) : 0;
    this.gamepadAxisCStick.x = pad.axis(2) ? pad.axis(2) : 0;
    this.gamepadAxisCStick.y = pad.axis(3) ? pad.axis(3) : 0;
  };
};
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function() {

  // Used to get directional input from either keyboard or gamepad
  var inputX = 0.0;
  var inputY = 0.0;
  if (this.game.input.keyboard.isDown(Phaser.KeyCode.D)) {
    inputX = 1.0;
  } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.A)) {
    inputX = -1.0;
  }
  if (this.game.input.keyboard.isDown(Phaser.KeyCode.S)) {
    inputY = 1.0;
  } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.W)) {
    inputY = -1.0;
  }
  if (this.gamepadAxis.getMagnitude() > 0.1) {
    inputX = this.gamepadAxis.x;
    inputY = this.gamepadAxis.y;
  }

  if (this.game.input.keyboard.isDown(Phaser.KeyCode.Q) || this.game.input.gamepad.isDown(Phaser.Gamepad.XBOX360_LEFT_TRIGGER)) {
    GameplayCameraAngle -= this.cameraMoveSpeed * this.game.time.elapsed;

    if (GameplayCameraAngle < -Math.PI) { GameplayCameraAngle = Math.PI; }
  } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.E) || this.game.input.gamepad.isDown(Phaser.Gamepad.XBOX360_RIGHT_TRIGGER)) {
    GameplayCameraAngle += this.cameraMoveSpeed * this.game.time.elapsed;

    if (GameplayCameraAngle > Math.PI) { GameplayCameraAngle = -Math.PI; }
  } else if (this.gamepadAxisCStick.x < -0.1) {
    GameplayCameraAngle -= this.cameraMoveSpeed * this.game.time.elapsed * Math.abs(this.gamepadAxisCStick.x);

    if (GameplayCameraAngle < -Math.PI) { GameplayCameraAngle = Math.PI; }
  } else if (this.gamepadAxisCStick.x > 0.1) {
    GameplayCameraAngle += this.cameraMoveSpeed * this.game.time.elapsed * Math.abs(this.gamepadAxisCStick.x);

    if (GameplayCameraAngle > Math.PI) { GameplayCameraAngle = -Math.PI; }
  }

  GameplayCameraData.yPush = Math.pow(this.gamepadAxisCStick.y * 128, 3) / 15000;

  if (this.game.input.keyboard.isDown(Phaser.KeyCode.M) || this.game.input.gamepad.isDown(Phaser.Gamepad.XBOX360_B)) {
    this.crouching = true;
  } else {
    this.crouching = false;
  }

  if (this.currentState === PlayerState.MOVING) {
    this.stamina = Math.min(1.0, this.stamina + this.game.time.elapsed * 0.0001);

    if (this.stamina > 0.99) {
      this.punishRecharging = false;
    }
  }
  this.timerSprite.tint = this.punishRecharging ? 0xDD0000 : 0x00DD00;
  this.timerSprite.width = this.stamina * 32;

  var moving = (Math.abs(inputX) > 0.01 || Math.abs(inputY) > 0.01);
  if (moving) {
    this.facingDirection.set(inputX, inputY);
    this.facingDirection.rotate(0, 0, GameplayCameraAngle + Math.PI / 2);
    this.facingDirection.normalize();
  }

  if (this.currentState === PlayerState.MOVING) {
    if (moving && this.crouching === false) {
      this.body.velocity.set(this.walkSpeed * this.facingDirection.x, this.walkSpeed * this.facingDirection.y);
    } else {
      this.body.velocity.set(0);
    }

    if (this.returnTargetTween === null) {
      this.targetPt.x = this.x;
      this.targetPt.y = this.y;
    }
  } else if (this.currentState === PlayerState.CHARGE) {
    this.body.velocity.set(0);

    if (moving) {
      this.targetPt.body.velocity.set(this.targetMoveSpeed * this.facingDirection.x, this.targetMoveSpeed * this.facingDirection.y);

      if (this.targetPt.position.distance(this.position) > this.maxTargetDistance) {
        var theta = Math.atan2(this.targetPt.y - this.position.y, this.targetPt.x - this.position.x);

        this.targetPt.position.set(this.position.x + Math.cos(theta) * this.maxTargetDistance, this.position.y + Math.sin(theta) * this.maxTargetDistance);
      } 
    } else {
      this.targetPt.body.velocity.set(0);
    }
  }

  // update animations
  var theta = Math.atan2(this.facingDirection.y, this.facingDirection.x) - GameplayCameraAngle - Math.PI * 0.5;
  if (theta > Math.PI) { theta -= Math.PI * 2; }
  if (theta < -Math.PI) { theta += Math.PI * 2; }

  if (this.alive) {
    if (this.currentState !== PlayerState.CHARGE) {
      if (theta >= Math.PI * 0.25 && theta <= Math.PI * 0.75) {
        this.animations.play(moving ? 'run_down' : 'idle_down');
      } else if (Math.abs(theta) > Math.PI * 0.75) {
        this.animations.play(moving ? 'run_left' : 'idle_left');
      } else if (Math.abs(theta) < Math.PI * 0.25) {
        this.animations.play(moving ? 'run_right' : 'idle_right');
      } else if (theta <= Math.PI * -0.25 && theta > Math.PI * -0.75) {
        this.animations.play(moving ? 'run_up' : 'idle_up' );
      }
    } else {
      if (theta >= Math.PI * 0.25 && theta <= Math.PI * 0.75) {
        this.animations.play('idle_down_focus');
      } else if (Math.abs(theta) > Math.PI * 0.75) {
        this.animations.play('idle_left_focus');
      } else if (Math.abs(theta) < Math.PI * 0.25) {
        this.animations.play('idle_right_focus');
      } else if (theta <= Math.PI * -0.25 && theta > Math.PI * -0.75) {
        this.animations.play('idle_up_focus' );
      }
    }

    if (this.crouching) {
      if (this.currentState === PlayerState.CHARGE) {
        this.animations.play('crouch_focus');
      } else {
        this.animations.play('crouch');
      }
    }
  } else {
    this.frame = 19;
  }
};
