// WARNING: This is gross icky state to bridge two things that don't typically render together. Here be "bad code"!

var ThreeJSCanvas = null;
var ThreeScene = null;
var ThreeCamera = null;
var ThreeRenderer = null;

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
  ThreeCamera.position.y = 40;
};

var setupThreeScene= function (game) {
  var tl = new THREE.TextureLoader();
  var spriteMap = tl.load('asset/img/finalrenderfordaniel1.png' );
  spriteMap.magFilter = THREE.NearestFilter;
  spriteMap.minFilter = THREE.LinearMipMapLinearFilter;
  spriteMap.wrapS = spriteMap.wrapT = THREE.RepeatWrapping;
  spriteMap.repeat.set(32 / 256, 32 / 256);
  spriteMap.offset.x = 6 / 8;
  spriteMap.offset.y = 1 / 8;

  var geometry = new THREE.BoxGeometry( 32, 32, 32 );
  var material = new THREE.MeshLambertMaterial( { map: spriteMap } );
  
  var map = game.state.getCurrentState().map;
  var background = game.state.getCurrentState().background;

  for (var tx = 0; tx < 10; tx++) {
      for (var ty = 0; ty < 10; ty++) {
	var tile = map.getTile(tx, ty, background);
	if (tile) {
	  var cube = new THREE.Mesh( geometry, material );
	  ThreeScene.add(cube);
	  cube.position.set(tx * 32, 0, ty * 32);
	}
      }
  }
};

var UpdateThreeScene = function (player) {
    ThreeCamera.position.x = player.x;
    ThreeCamera.position.z = player.y;
};

