var WolfState = {
  PATROL: 0,
  ALERT: 1,
  LEAPING: 2,
  CONFUSED: 3,
  NOTICING: 4,
  CHASING: 5,
};

const WolfWalkSpeed = 100;
const WolfChaseSpeed = 200;
const WolfSightAngle = Math.PI * 0.5;
const WolfSightRadius = 250;
const WolfPauseTime = 400;
const WolfQuestionTime = 1100;
const WolfLeapSpeed = 450;
const WolfLeapTime = 180;
const WolfDazeTime = 800;

var Wolf = function (game, x, y, player, pathSetup, nodeMap, map, foregroundLow, foregroundHigh) {
  Phaser.Sprite.call(this, game, x, y, 'jesseSheet1_32x64', 0);

  this.tint = 0xFF0000;

  this.facing = 0.0;

  this.map = map;
  this.foregroundLow = foregroundLow;
  this.foregroundHigh = foregroundHigh;

  this.currentPath = [];
  this.currentPathNextNode = 0;
  this.patrolPath = JSON.parse(pathSetup);
  this.currentPatrolNode = 0;
  this.setPathToPoint(new Phaser.Point(this.patrolPath[this.currentPatrolNode][0] * 32, this.patrolPath[this.currentPatrolNode][1] * 32));

  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.anchor.set(0.5, 1);
  this.body.setSize(30, 32);
  this.body.offset.set(1, 32);

  this.currentState = WolfState.PATROL;
  this.player = player;
  this.nextEvent = null;

  this.kill();
};
Wolf.prototype = Object.create(Phaser.Sprite.prototype);
Wolf.prototype.constructor = Wolf;
Wolf.prototype.isPlayerInSight = function () {
  var angleToPlayer = this.position.angle(this.player.position);
  if (Math.abs(Phaser.Math.getShortestAngle(angleToPlayer * Phaser.Math.RAD_TO_DEG, this.facing * Phaser.Math.RAD_TO_DEG) * Phaser.Math.DEG_TO_RAD) < WolfSightAngle) {
    if (this.position.distance(this.player.position) < WolfSightRadius) {
        var testLine = new Phaser.Line(this.x, this.y, this.player.x, this.player.y);
        var layerToTest = this.player.crouching ? this.foregroundLow : this.foregroundHigh;

        if (layerToTest.getRayCastTiles(testLine, 16, true).length > 0) {
          return false;
        }

        return true;
      }
    }

    return false;

};
Wolf.prototype.removeNextEvent = function () {
  if (this.nextEvent !== null) {
    this.game.time.events.remove(this.nextEvent);
    this.nextEvent = null;
  }
};
Wolf.prototype.confuse = function () {
  this.removeNextEvent();

  this.currentState = WolfState.CONFUSED;
  this.nextEvent = this.game.time.events.add(WolfDazeTime, function () {
    this.removeNextEvent();

    this.nextEvent = this.game.time.events.add(WolfPauseTime, this.leapFunc, this);
  }, this);
};
Wolf.prototype.noticePoint = function (positionToNotice) {
  // if we're confused or chasing the player, dont do this
  if (this.currentState === WolfState.NOTICING || this.currentState === WolfState.CONFUSED || this.currentState === WolfState.LEAPING || this.currentState === WolfState.ALERT) {
    return;
  }

  this.removeNextEvent();
  this.currentState = WolfState.NOTICING;
  this.facing = this.position.angle(positionToNotice);
  this.nextEvent = this.game.time.events.add(WolfQuestionTime, function () {
    this.removeNextEvent();
    this.currentState = WolfState.PATROL;
  }, this);
};
Wolf.prototype.leapFunc = function () {
  if (this.isPlayerInSight()) {
    this.currentState = WolfState.LEAPING;
    this.facing = this.position.angle(this.player.position);

    this.nextEvent = this.game.time.events.add(WolfLeapTime, function () {
      this.currentState = WolfState.ALERT;
      this.nextEvent = this.game.time.events.add(WolfPauseTime, this.leapFunc, this);
    }, this);
  } else {
    this.currentState = WolfState.PATROL;
    this.setPathToPoint(new Phaser.Point(this.patrolPath[this.currentPatrolNode][0] * 32, this.patrolPath[this.currentPatrolNode][1] * 32));
  }
};
Wolf.prototype.computePath = function (destX, destY) {
  var gridClone = this.map.data.navGrid.clone();
  return this.map.data.navFinder.findPath(~~(this.position.x / 32), ~~(this.position.y / 32), destX, destY, gridClone);
};
Wolf.prototype.setPathToPoint = function(position) {
  var path = this.computePath(~~(position.x / 32), ~~(position.y / 32));
  this.currentPath = path.map(function (p) { return new Phaser.Point(p[0] * 32 + 16, p[1] * 32 + 16) });
  this.currentPathNextNode = 0;
};
Wolf.prototype.chasePlayer = function() {
  this.setPathToPoint(this.player.position);
  this.currentState = WolfState.CHASING;
};
Wolf.prototype.update = function () {

  if (this.currentState === WolfState.PATROL) {
    // if distance to node is close, go to next node
    if (this.position.distance(this.currentPath[this.currentPathNextNode]) < 3) {
      this.currentPathNextNode++;

      if (this.currentPathNextNode === this.currentPath.length) {
        this.currentPatrolNode = (this.currentPatrolNode + 1) % this.patrolPath.length;
        this.setPathToPoint(new Phaser.Point(this.patrolPath[this.currentPatrolNode][0] * 32, this.patrolPath[this.currentPatrolNode][1] * 32));
      }
    }

    this.facing = this.position.angle(this.currentPath[this.currentPathNextNode]);
    this.body.velocity.set(Math.cos(this.facing) * WolfWalkSpeed, Math.sin(this.facing) * WolfWalkSpeed);

    if (this.isPlayerInSight()) {
      this.chasePlayer();
    }
  } else if (this.currentState === WolfState.ALERT) {
    this.body.velocity.set(0);
  } else if (this.currentState === WolfState.LEAPING) {
    this.body.velocity.set(WolfLeapSpeed * Math.cos(this.facing), WolfLeapSpeed * Math.sin(this.facing));
  } else if (this.currentState === WolfState.CONFUSED) {
    this.body.velocity.set(0);
  } else if (this.currentState === WolfState.NOTICING) {
    this.body.velocity.set(0);

    if (this.isPlayerInSight()) {
      this.chasePlayer();
    }
  } else if (this.currentState === WolfState.CHASING) {
    // if distance to node is close, go to next node
    if (this.position.distance(this.currentPath[this.currentPathNextNode]) < 3) {
      this.currentPathNextNode++;

      if (this.currentPathNextNode === this.currentPath.length) {
        if (this.isPlayerInSight()) {
          this.chasePlayer();
        } else {
          this.currentState = WolfState.PATROL;
          this.setPathToPoint(new Phaser.Point(this.patrolPath[this.currentPatrolNode][0] * 32, this.patrolPath[this.currentPatrolNode][1] * 32));
        }
      }
    }

    this.facing = this.position.angle(this.currentPath[this.currentPathNextNode]);
    this.body.velocity.set(Math.cos(this.facing) * WolfChaseSpeed, Math.sin(this.facing) * WolfChaseSpeed);

    if (this.position.distance(this.player.position) < 96) {
      this.leapFunc();
    }
  }

  // determine our sprite direction
  var theta = this.facing - GameplayCameraAngle - Math.PI * 0.5;
  if (theta > Math.PI) { theta -= Math.PI * 2; }
  if (theta < -Math.PI) { theta += Math.PI * 2; }

  if (theta >= Math.PI * 0.25 && theta <= Math.PI * 0.75) {
    this.frame = 0;
    this.data.threeSprite.scale.x = 32;
  } else if (Math.abs(theta) > Math.PI * 0.75) {
    this.frame = 2;
    this.data.threeSprite.scale.x = 32;
  } else if (Math.abs(theta) < Math.PI * 0.25) {
    this.frame = 2;
    this.data.threeSprite.scale.x = -32;
  } else if (theta <= Math.PI * -0.25 && theta > Math.PI * -0.75) {
    this.frame = 1;
    this.data.threeSprite.scale.x = 32;
  }
};
