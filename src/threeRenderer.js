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

  var geometry = new THREE.BoxGeometry( 32, 32, 32 );
  var material = new THREE.MeshLambertMaterial( { map: grass } );
  var material2 = new THREE.MeshLambertMaterial( { map: stone } );
  
  var map = game.state.getCurrentState().map;
  var background = game.state.getCurrentState().background;
  var foreground = game.state.getCurrentState().foreground;

  for (var tx = 0; tx < 10; tx++) {
      for (var ty = 0; ty < 10; ty++) {
	var tile = map.getTile(tx, ty, background);
	if (tile) {
	  var cube = new THREE.Mesh( geometry, material );
	  ThreeScene.add(cube);
	  cube.position.set(tx * 32, 0, ty * 32);
	}
	
	var tile = map.getTile(tx, ty, foreground);
	if (tile) {
	  var cube = new THREE.Mesh( geometry, material2 );
	  ThreeScene.add(cube);
	  cube.position.set(tx * 32, 32, ty * 32);
	}
      }
  }
};

var UpdateThreeScene = function (player) {
    ThreeCamera.position.x = player.x;
    ThreeCamera.position.z = player.y;
};

