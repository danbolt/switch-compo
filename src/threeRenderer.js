// WARNING: This is gross icky state to bridge two things that don't typically render together. Here be "bad code"!

var ThreeJSCanvas = null;
var ThreeScene = null;
var ThreeCamera = null;
var ThreeRenderer = null;

var JesseSheetTexture = null;
var TreesTexture = null;
var TileMaterialMap = {};
var TreesMaterialMap = {};

var GameplayCameraDistance = 250;
var GameplayCameraAngle = -Math.PI / 2;
const GameplayWalkingFov = 50;
const GameplayCrouchingFov = 40;
const GameplayPSIFov = 70;
var GameplayCameraData = { fov: GameplayWalkingFov, zDist: GameplayCameraDistance, yDist: 220, yPush: 0 };
var GameplayFovChangeTween = null;

var sprite = null; // TODO: rename me
var target = null;
var wolves = null;
var rainDrops = [];

var rainMat = new THREE.LineBasicMaterial({
    color: 0x0000ff
  });
var rainGeom = new THREE.Geometry();
  rainGeom.vertices.push(
    new THREE.Vector3( 0, -10, 0 ),
    new THREE.Vector3( 0,  10, 0 ),
  );
var rainGeomBuffer = new THREE.BufferGeometry();
rainGeomBuffer.fromGeometry(rainGeom);

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

        
        var material = new THREE.MeshLambertMaterial( { map: texture, transparent: false } );
        TileMaterialMap[(x + (y * (JesseSheetTexture.image.width / 32)))] = material;
      }
    }
  });

  tl.load('asset/img/trees.png', function (loadedTexture) {
    TreesTexture = loadedTexture;

    for (var i = 0; i < 15; i++) {
      var texture = TreesTexture.clone();
      texture.needsUpdate = true;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(96 / TreesTexture.image.width, 160 / TreesTexture.image.height);
      texture.offset.x =  (i % 5) * (96 / (TreesTexture.image.width));
      texture.offset.y = 1 - (~~(i / 5) + 1) * (160 / TreesTexture.image.height) ;

      var material = new THREE.SpriteMaterial( { map: texture, fog: true } );
      TreesMaterialMap[i] = material;
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
  //target.add(new THREE.Mesh(circle, TileMaterialMap[57]));
  //target.children[0].position.y = 2;
  //target.children[0].rotation.x = Math.PI * -0.5;

  // populate small tilemap
  var map = game.state.getCurrentState().map;
  var background = game.state.getCurrentState().background;
  var foreground = game.state.getCurrentState().foreground;
  var foreground2 = game.state.getCurrentState().highForeground;
  for (var tx = 0; tx < map.width; tx++) {
      for (var ty = 0; ty < map.height; ty++) {
      	var tile = map.getTile(tx, ty, background);
      	if (tile && tile.index !== 1) {
      	  var cube = new THREE.Mesh( geometry, TileMaterialMap[tile.index] );
      	  ThreeScene.add(cube);
      	  cube.position.set(tx * 32 + 16, 0, ty * 32 + 16);
      	}
      	
      	var tile = map.getTile(tx, ty, foreground);
      	if (tile && tile.index !== 1) {
      	  var cube = new THREE.Mesh( geometry, TileMaterialMap[tile.index] );
      	  ThreeScene.add(cube);
      	  cube.position.set(tx * 32 + 16, 32, ty * 32 + 16);
        }
          
        var tile = map.getTile(tx, ty, foreground2);
      	if (tile && tile.index !== 1) {
      	  var cube = new THREE.Mesh( geometry, TileMaterialMap[tile.index] );
      	  ThreeScene.add(cube);
      	  cube.position.set(tx * 32 + 16, 64, ty * 32 + 16);
 
      	}
      }
  }


  if (map.properties.raining) {
    for (var i = 0; i < 48; i++) {
      var rainDrop = new THREE.Line( rainGeom, rainMat );
      rainDrop.position.set(64 * i, 64, 1250 + ~~(Math.random() * 250));
      ThreeScene.add(rainDrop); 
      rainDrops.push(rainDrop);
    }
  }

  if (map.objects.decor) {
    map.objects.decor.forEach(function (item) {
      if (item.type === "tree") {
        var material = TreesMaterialMap[0];
        var scaleFactor = 1.0;
        if (item.properties.index && isNaN(Number.parseInt(item.properties.index)) === false) {
          material = TreesMaterialMap[Number.parseInt(item.properties.index)];
        }
        if (item.properties.scale && isNaN(Number.parseFloat(item.properties.scale)) === false) {
          scaleFactor = Number.parseFloat(item.properties.scale);
        }
        var sprite = new THREE.Sprite(material);
        sprite.position.set(item.x + 16, 14, item.y + 16);
        sprite.scale.set(96 * scaleFactor, 160 * scaleFactor, 96 * scaleFactor);
        sprite.center.x = 0.575;
        sprite.center.y = 0;
        ThreeScene.add(sprite);
      }
    }, this);
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

    var viewGeom = new THREE.Geometry();
    var sightRadius = WolfSightRadius + 16;
    viewGeom.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(sightRadius * Math.cos(WolfSightAngle / 1), 0, sightRadius * Math.sin(WolfSightAngle / 1)),
      new THREE.Vector3(sightRadius * Math.cos(0), 0, sightRadius * Math.sin(0)),
      new THREE.Vector3(sightRadius * Math.cos(WolfSightAngle / -1), 0, sightRadius * Math.sin(WolfSightAngle / -1)),
      new THREE.Vector3(sightRadius * Math.cos(WolfSightAngle / 1), 62, sightRadius * Math.sin(WolfSightAngle / 1)),
      new THREE.Vector3(sightRadius * Math.cos(0), 62, sightRadius * Math.sin(0)),
      new THREE.Vector3(sightRadius * Math.cos(WolfSightAngle / -1), 62, sightRadius * Math.sin(WolfSightAngle / -1)),
    );
    viewGeom.faces.push(new THREE.Face3(0, 2, 1), new THREE.Face3(0, 3, 2),
                        //new THREE.Face3(0, 1, 4), new THREE.Face3(0, 6, 3),
                        //new THREE.Face3(0, 4, 5), new THREE.Face3(0, 5, 6),
    );
    var viewMatieral = new THREE.MeshLambertMaterial({side: THREE.BackSide, color: 0x770000, transparent: true, opacity: 0.145});
    viewMatieral.blending = THREE.AdditiveBlending;
    var viewMesh = new THREE.Mesh(viewGeom, viewMatieral);
    ThreeScene.add(viewMesh);
    w.data.threeViewMesh = viewMesh;
  }, this);
};

var UpdateThreeScene = function (player, wolves) {
  ThreeCamera.position.x = (player.x + player.targetPt.x) / 2 - GameplayCameraData.zDist * Math.cos(GameplayCameraAngle);
  ThreeCamera.position.y = GameplayCameraData.yDist + GameplayCameraData.yPush;
  ThreeCamera.position.z = (player.y + player.targetPt.y) / 2 - GameplayCameraData.zDist * Math.sin(GameplayCameraAngle);
  ThreeCamera.lookAt((player.x + player.targetPt.x) / 2, 16, (player.y + player.targetPt.y) / 2);

  sprite.position.set(player.x, 42 + (player.crouching ? -20 : 0), player.y + 16);
  sprite.material.map.offset.x = (player.animations.frame % 8) / 8;
  sprite.material.map.offset.y = (3 - ~~(player.animations.frame / 8)) / 4;
  sprite.scale.set(player.animations.currentAnim.name === 'run_right' || player.animations.currentAnim.name === 'idle_right' ? -32 : 32, 64, 32);

  target.position.set(player.targetPt.x, 16.1, player.targetPt.y + 16);
  target.rotation.y = player.targetPt.rotation;
  target.visible = player.targetPt.alive;

  wolves.forEach(function (w) {
    w.data.threeSprite.material.map.offset.x = (w.animations.frame % 8) / 8;
    w.data.threeSprite.material.map.offset.y = (3 - ~~(w.animations.frame / 8)) / 4;
    w.data.threeSprite.position.set(w.x, 48, w.y);
    w.data.threeViewMesh.position.set(w.data.threeSprite.position.x, w.currentState === WolfState.CONFUSED ? 2000 : 17, w.data.threeSprite.position.z)
    w.data.threeViewMesh.rotation.y = w.facing * -1;
  });

  rainDrops.forEach(function (rainDrop) {
    rainDrop.translateY(player.game.time.elapsed / -1.25 );

    if (rainDrop.position.y < 0) {
      rainDrop.position.x = sprite.position.x - 512 + ~~(Math.random() * 1024);
      rainDrop.position.z = sprite.position.z - 512 + ~~(Math.random() * 1024);
      rainDrop.translateY(128 + Math.random() * 64);
    }
  }, this);
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

  rainDrops = [];
};

