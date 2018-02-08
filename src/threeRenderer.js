// WARNING: This is gross icky state to bridge two things that don't typically render together. Here be "bad code"!

var ThreeJSCanvas = null;
var ThreeScene = null;
var ThreeCamera = null;
var ThreeRenderer = null;

var JesseSheetTexture = null;
var TileMaterialMap = {};

var GameplayCameraDistance = 250;
var GameplayCameraAngle = -Math.PI / 2;
const GameplayWalkingFov = 50;
const GameplayCrouchingFov = 40;
const GameplayPSIFov = 70;
var GameplayCameraData = { fov: GameplayWalkingFov, zDist: GameplayCameraDistance, yDist: 200 };
var GameplayFovChangeTween = null;

var sprite = null; // TODO: rename me
var target = null;
var wolves = null;

var loadThreeTextures = function () {
  var tl = new THREE.TextureLoader();
  tl.load('asset/img/finalrenderfordaniel1.png', function (loadedTexture) {
    JesseSheetTexture = loadedTexture;

    // create a hash table of materials for each block texture
    for (var x = 0; x < JesseSheetTexture.image.width / 32; x++) {
      for (var y = 0; y < JesseSheetTexture.image.height / 32; y++) {
        var texture = JesseSheetTexture.clone();
        texture.needsUpdate = true;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(32 / JesseSheetTexture.image.width, 32 / JesseSheetTexture.image.height);
        texture.offset.x = (x - 1) / (JesseSheetTexture.image.width / 32);
        texture.offset.y = ((JesseSheetTexture.image.height / 32 - 1) - y) / (JesseSheetTexture.image.height / 32);

        
        var material = new THREE.MeshLambertMaterial( { map: texture, transparent: true } );
        TileMaterialMap[(x + (y * (JesseSheetTexture.image.width / 32)))] = material;
      }
    }
  });
};

var setupThree = function () {
  ThreeScene = new THREE.Scene();
  ThreeCamera = new THREE.PerspectiveCamera( GameplayCameraData.value, 320 / 240, 0.1, 1000 );
  ThreeRenderer = new THREE.WebGLRenderer( { alpha: false } );
  ThreeRenderer.setSize(320, 240);

  document.body.appendChild( ThreeRenderer.domElement );

  ThreeJSCanvas = ThreeRenderer.domElement;

  var backgroundColor = new THREE.Color( 0x3a4d51 );
  ThreeScene.fog = new THREE.FogExp2(backgroundColor, 0.0024);
  ThreeScene.background = backgroundColor;

  ThreeCamera.position.x = 100;
  ThreeCamera.position.z = 250;
  ThreeCamera.position.y = GameplayCameraData.yDist;
};

var setupThreeScene= function (game, player, wolves) {
  var ambient = new THREE.AmbientLight(0x888888);
  ThreeScene.add(ambient);
  var directional = new THREE.DirectionalLight(0xFFFFFF, 0.3);
  ThreeScene.add(directional);

  var playerSprite = JesseSheetTexture.clone();
  playerSprite.needsUpdate = true;
  playerSprite.magFilter = THREE.NearestFilter;
  playerSprite.minFilter = THREE.NearestFilter;
  playerSprite.wrapS = playerSprite.wrapT = THREE.RepeatWrapping;
  playerSprite.repeat.set(32 / 256, 64 / 256);
  playerSprite.offset.x = 0 / 8;
  playerSprite.offset.y = 3 / 4;

  var geometry = new THREE.BoxGeometry( 32, 32, 32 );
  var sphere = new THREE.SphereGeometry(player.targetPt.data.radius, 3, 3);
  var circle = new THREE.CircleGeometry(player.targetPt.data.soundRange, 8);
  var material3 = new THREE.SpriteMaterial( { fog: true, map: playerSprite } );
 
  sprite = new THREE.Sprite(material3);
  sprite.scale.set(32, 64, 32);
  ThreeScene.add(sprite);
  player.data.threeSprite = sprite;

  target = new THREE.Mesh(sphere, TileMaterialMap[57]);
  ThreeScene.add(target);
  target.add(new THREE.Mesh(circle, TileMaterialMap[57]));
  target.children[0].position.y = 2;
  target.children[0].rotation.x = Math.PI * -0.5;

  // populate small tilemap
  var map = game.state.getCurrentState().map;
  var background = game.state.getCurrentState().background;
  var foreground = game.state.getCurrentState().foreground;
  var foreground2 = game.state.getCurrentState().highForeground;
  for (var tx = 0; tx < map.width; tx++) {
      for (var ty = 0; ty < map.height; ty++) {
      	var tile = map.getTile(tx, ty, background);
      	if (tile) {
      	  var cube = new THREE.Mesh( geometry, TileMaterialMap[tile.index] );
      	  ThreeScene.add(cube);
      	  cube.position.set(tx * 32 + 16, 0, ty * 32 + 16);
      	}
      	
      	var tile = map.getTile(tx, ty, foreground);
      	if (tile) {
      	  var cube = new THREE.Mesh( geometry, TileMaterialMap[tile.index] );
      	  ThreeScene.add(cube);
      	  cube.position.set(tx * 32 + 16, 32, ty * 32 + 16);
        }
          
        var tile = map.getTile(tx, ty, foreground2);
      	if (tile) {
      	  var cube = new THREE.Mesh( geometry, TileMaterialMap[tile.index] );
      	  ThreeScene.add(cube);
      	  cube.position.set(tx * 32 + 16, 64, ty * 32 + 16);
 
      	}
      }
  }

  wolves.children.forEach(function (w) {
    var wolfSpriteTexture = JesseSheetTexture.clone();
    wolfSpriteTexture.needsUpdate = true;
    wolfSpriteTexture.magFilter = THREE.NearestFilter;
    wolfSpriteTexture.minFilter = THREE.NearestFilter;
    wolfSpriteTexture.wrapS = wolfSpriteTexture.wrapT = THREE.RepeatWrapping;
    wolfSpriteTexture.repeat.set(32 / 256, 64 / 256);
    wolfSpriteTexture.offset.x = 0 / 8;
    wolfSpriteTexture.offset.y = 3 / 4;

    var wolfSpriteMaterial = new THREE.SpriteMaterial( {fog: true, map: wolfSpriteTexture });
    wolfSpriteMaterial.color = new THREE.Color(0xDD4444);

    var sprite = new THREE.Sprite(wolfSpriteMaterial);
    sprite.position.set(w.x, 48, w.y);
    sprite.scale.set(32, 64, 32);
    ThreeScene.add(sprite);

    w.data.threeTexture = wolfSpriteTexture;
    w.data.threeMaterial = wolfSpriteMaterial;
    w.data.threeSprite = sprite;

    var losDebugGeom = new THREE.CircleBufferGeometry(WolfSightRadius, 32);
    var losWireframeGeom = new THREE.WireframeGeometry(losDebugGeom);
    var lines = new THREE.LineSegments(losWireframeGeom);
    lines.material.depthTest = false;
    lines.material.transparent = true;
    lines.scale.set(1 / sprite.scale.x, 2 / sprite.scale.y, 1 / sprite.scale.z)
    lines.rotation.x = Math.PI / 2;
    lines.position.y = 0.3
    sprite.add(lines);
  }, this);
};

var UpdateThreeScene = function (player, wolves) {
  ThreeCamera.position.x = player.x - GameplayCameraData.zDist * Math.cos(GameplayCameraAngle);
  ThreeCamera.position.y = GameplayCameraData.yDist;
  ThreeCamera.position.z = player.y + 16 - GameplayCameraData.zDist * Math.sin(GameplayCameraAngle);
  ThreeCamera.lookAt(player.x, 16, player.y - 16);

  sprite.position.set(player.x, 42 + (player.crouching ? -20 : 0), player.y + 16);
  sprite.material.map.offset.x = (player.animations.frame % 8) / 8;
  sprite.material.map.offset.y = (3 - ~~(player.animations.frame / 8)) / 4;
  sprite.scale.set(player.animations.currentAnim.name === 'run_right' || player.animations.currentAnim.name === 'idle_right' ? -32 : 32, 64, 32);

  target.position.set(player.targetPt.x, 16.1, player.targetPt.y);
  target.rotation.y = player.targetPt.rotation;
  target.visible = player.targetPt.alive;

  wolves.forEach(function (w) {
    w.data.threeSprite.material.map.offset.x = (w.animations.frame % 8) / 8;
    w.data.threeSprite.material.map.offset.y = (3 - ~~(w.animations.frame / 8)) / 4;
    w.data.threeSprite.position.set(w.x, 48, w.y - 16);
  });
};

var UnloadThreeScene = function(wolves) {
  sprite.material.map.dispose();
  sprite.material.dispose();

  wolves.forEach(function (wolf) {
    wolf.data.threeSprite.material.map.dispose();
    wolf.data.threeSprite.material.dispose();
  }, this);

  while (ThreeScene.children.length) {
    ThreeScene.remove(ThreeScene.children[0]);
  }
};

