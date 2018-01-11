// WARNING: This is gross icky state to bridge two things that don't typically render together. Here be "bad code"!

var ThreeJSCanvas = null;
var ThreeScene = null;
var ThreeCamera = null;
var ThreeRenderer = null;

var sprite = null; // TODO: rename me
var target = null;

var setupThree = function () {
  ThreeScene = new THREE.Scene();
  ThreeCamera = new THREE.PerspectiveCamera( 75, 320 / 240, 0.1, 1000 );
  ThreeRenderer = new THREE.WebGLRenderer( { alpha: false } );
  ThreeRenderer.setSize(320, 240);

  document.body.appendChild( ThreeRenderer.domElement );

  ThreeJSCanvas = ThreeRenderer.domElement;

  var ambient = new THREE.AmbientLight(0x888888);
  ThreeScene.add(ambient);
  var directional = new THREE.DirectionalLight(0xFFFFFF, 0.3);
  ThreeScene.add(directional);

  ThreeCamera.position.x = 100;
  ThreeCamera.position.z = 250;
  ThreeCamera.position.y = 130;
};

var setupThreeScene= function (game) {
  var tl = new THREE.TextureLoader();
  var grass = tl.load('asset/img/finalrenderfordaniel1.png' );
  grass.magFilter = THREE.NearestFilter;
  grass.minFilter = THREE.LinearMipMapLinearFilter;
  grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
  grass.repeat.set(32 / 256, 32 / 256);
  grass.offset.x = 6 / 8;
  grass.offset.y = 1 / 8;

  var stone = tl.load('asset/img/finalrenderfordaniel1.png' );
  stone.magFilter = THREE.NearestFilter;
  stone.minFilter = THREE.LinearMipMapLinearFilter;
  stone.wrapS = grass.wrapT = THREE.RepeatWrapping;
  stone.repeat.set(32 / 256, 32 / 256);
  stone.offset.x = 4 / 8;
  stone.offset.y = 6 / 8;

  var playerSprite = tl.load('asset/img/finalrenderfordaniel1.png' );
  playerSprite.magFilter = THREE.NearestFilter;
  playerSprite.minFilter = THREE.LinearMipMapLinearFilter;
  playerSprite.wrapS = grass.wrapT = THREE.RepeatWrapping;
  playerSprite.repeat.set(32 / 256, 64 / 256);
  playerSprite.offset.x = 0 / 8;
  playerSprite.offset.y = 3 / 4;

  var targetSprite = tl.load('asset/img/finalrenderfordaniel1.png' );
  targetSprite.magFilter = THREE.NearestFilter;
  targetSprite.minFilter = THREE.LinearMipMapLinearFilter;
  targetSprite.wrapS = grass.wrapT = THREE.RepeatWrapping;
  targetSprite.repeat.set(32 / 256, 32 / 256);
  targetSprite.offset.x = 0 / 8;
  targetSprite.offset.y = 0 / 8;

  var geometry = new THREE.BoxGeometry( 32, 32, 32 );
  var sphere = new THREE.SphereGeometry(32, 3, 3);
  var material = new THREE.MeshLambertMaterial( { map: grass, transparent: true } );
  var material2 = new THREE.MeshLambertMaterial( { map: stone, transparent: true } );
  var material3 = new THREE.SpriteMaterial( { fog: true, map: playerSprite } );
  var material4 = new THREE.MeshLambertMaterial( { map: targetSprite, transparent: true } );
 
  sprite = new THREE.Sprite(material3);
  sprite.scale.set(32, 64, 32);
  ThreeScene.add(sprite);

  target = new THREE.Mesh(sphere, material4);
  ThreeScene.add(target);

  // populate small tilemap
  var map = game.state.getCurrentState().map;
  var background = game.state.getCurrentState().background;
  var foreground = game.state.getCurrentState().foreground;
  for (var tx = 0; tx < map.width; tx++) {
      for (var ty = 0; ty < map.height; ty++) {
      	var tile = map.getTile(tx, ty, background);
      	if (tile) {
      	  var cube = new THREE.Mesh( geometry, material );
      	  ThreeScene.add(cube);
      	  cube.position.set(tx * 32 + 16, 0, ty * 32 + 16);
      	}
      	
      	var tile = map.getTile(tx, ty, foreground);
      	if (tile) {
      	  var cube = new THREE.Mesh( geometry, material2 );
      	  ThreeScene.add(cube);
      	  cube.position.set(tx * 32 + 16, 32, ty * 32 + 16);
      	}
      }
  }
};

var UpdateThreeScene = function (player) {
  ThreeCamera.position.x = player.x;
  ThreeCamera.position.z = player.y + 120;
  ThreeCamera.lookAt(player.x, 0, player.y);

  sprite.position.set(player.x, 48, player.y - 16);
  sprite.material.map.offset.x = (player.animations.frame % 8) / 8;
  sprite.material.map.offset.y = (3 - ~~(player.animations.frame / 8)) / 4;
  sprite.scale.set(player.animations.currentAnim.name === 'run_right' ? -32 : 32, 64, 32);

  target.position.set(player.targetPt.x, 16, player.targetPt.y);
  target.rotation.y = player.targetPt.rotation;
  target.visible = player.targetPt.alive;
};

