var WolfState = {
  PATROL: 0,
  ALERT: 1,
  LEAPING: 2,
  CONFUSED: 3,
  RETURNING: 4,
  DYING: 5
};

const WolfWalkSpeed = 100;
const WolfSightAngle = Math.PI * 0.4;
const WolfSightRadius = 128;
const WolfPauseTime = 300;
const WolfLeapSpeed = 400;
const WolfLeapTime = 180;

var Wolf = function (game, x, y, player, pathSetup, nodeMap) {
  Phaser.Sprite.call(this, game, x, y, 'jesseSheet1_32x64', 0);

  this.tint = 0xFF0000;

  this.facing = 0.0;

  this.currentPatrolNode = 0;
  this.patrolPath = [];
  JSON.parse(pathSetup).forEach(function (nodeName) {
    this.patrolPath.push(new Phaser.Point(nodeMap[nodeName].x + nodeMap[nodeName].width / 2, nodeMap[nodeName].y + nodeMap[nodeName].height / 2));
  }, this);

  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.anchor.set(0.5, 1);
  this.body.setSize(30, 32);
  this.body.offset.set(1, 32);

  this.currentState = WolfState.PATROL;
  this.player = player;

  this.kill();

  this.events.onRevived.add(function () {
    //
  }, this);

  this.events.onKilled.add(function() {
    console.log('died!');
    this.data.threeSprite.visible = false;
  }, this);
};
Wolf.prototype = Object.create(Phaser.Sprite.prototype);
Wolf.prototype.constructor = Wolf;
Wolf.prototype.isPlayerInSight = function () {
  var angleToPlayer = this.position.angle(this.player.position);
  if (Math.abs(Phaser.Math.getShortestAngle(angleToPlayer * Phaser.Math.RAD_TO_DEG, this.facing * Phaser.Math.RAD_TO_DEG) * Phaser.Math.DEG_TO_RAD) < WolfSightAngle) {
    if (this.position.distance(this.player.position) < WolfSightRadius) {
      return true;
    }
  }

  return false;
};
Wolf.prototype.update = function () {

  if (this.currentState === WolfState.PATROL) {
    // if distance to node is close, go to next node
    if (this.position.distance(this.patrolPath[this.currentPatrolNode]) < 4) {
      this.currentPatrolNode = (this.currentPatrolNode + 1) % this.patrolPath.length;
    }

    this.facing = this.position.angle(this.patrolPath[this.currentPatrolNode]);
    this.body.velocity.set(Math.cos(this.facing) * WolfWalkSpeed, Math.sin(this.facing) * WolfWalkSpeed);

    if (this.isPlayerInSight()) {
      this.currentState = WolfState.ALERT;

      var leapFunc = function () {
        if (this.isPlayerInSight()) {
          this.currentState = WolfState.LEAPING;
          this.facing = this.position.angle(this.player.position);

          this.game.time.events.add(WolfLeapTime, function () {
            this.currentState = WolfState.ALERT;
            this.game.time.events.add(WolfPauseTime, leapFunc, this);
          }, this);
        } else {
          this.currentState = WolfState.PATROL;
        }
      };
      this.game.time.events.add(WolfPauseTime, leapFunc, this);
    }
  } else if (this.currentState === WolfState.ALERT) {
    this.body.velocity.set(0);
  } else if (this.currentState === WolfState.LEAPING) {
    this.body.velocity.set(WolfLeapSpeed * Math.cos(this.facing), WolfLeapSpeed * Math.sin(this.facing));
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