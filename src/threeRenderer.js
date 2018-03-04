// WARNING: This is gross icky state to bridge two things that don't typically render together. Here be "bad code"!

var ThreeJSCanvas = null;
var ThreeScene = null;
var ThreeCamera = null;
var ThreeRenderer = null;

var TilesTexture = null;
var TreesTexture = null;
var CharactersTexture = null;
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

var targetMaterial = new THREE.ShaderMaterial({uniforms: {
      time: { type: "f", value: 1.0 }
    }, transparent: true, vertexShader: `
    varying float angle;
    void main() {
      vec4 vNormal = normalize(modelViewMatrix * vec4(normal, 0.0));
      vec4 vPos = normalize(modelViewMatrix * vec4(position, 1.0));
      vec4 vCamera = normalize(vec4(cameraPosition, 1.0));
      angle = acos(dot(vNormal.xyz, normalize(vCamera.xyz - vPos.xyz))) / 3.141;

      gl_Position = projectionMatrix *
                    modelViewMatrix *
                    vec4(position,1.0);
    }
    `, fragmentShader: `
    varying float angle;
    uniform float time;

    void main() {
      vec4 defaultColor = vec4(0.5, 0.5, 0.0, angle < 0.35 ? 0.5 : (angle - 0.35)/0.65);

      float dist = 16.0;
      float px = mod(gl_FragCoord.x + time * -4.0 * cos(time) * 4.0 * cos(time), dist) / dist;
      float py = mod(gl_FragCoord.y + time * -4.0 * sin(time) * 4.0 * cos(time), dist) / dist;
      float d = sqrt(pow(px - 0.5, 2.0) + pow(py - 0.5, 2.0));
      defaultColor = defaultColor + vec4(d, d, d, 0.0);

      gl_FragColor = defaultColor;
    }
    ` });

var loadThreeTextures = function () {
  var tl = new THREE.TextureLoader();
  tl.load('asset/img/finalrenderfordaniel1.png', function (loadedTexture) {
    TilesTexture = loadedTexture;

    // create a hash table of materials for each block texture
    for (var x = 0; x < TilesTexture.image.width / 32; x++) {
      for (var y = 0; y < TilesTexture.image.height / 32; y++) {
        var texture = TilesTexture.clone();
        texture.needsUpdate = true;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(32 / TilesTexture.image.width, 32 / TilesTexture.image.height);
        texture.offset.x = (x - 1) / (TilesTexture.image.width / 32);
        texture.offset.y = ((TilesTexture.image.height / 32 - 1) - y) / (TilesTexture.image.height / 32);

        
        var material = new THREE.MeshLambertMaterial( { map: texture, transparent: false } );
        TileMaterialMap[(x + (y * (TilesTexture.image.width / 32)))] = material;
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

  tl.load('asset/img/playerSprite.png', function (loadedTexture) {
    CharactersTexture = loadedTexture;
  });
};

var setupThree = function () {
  ThreeScene = new THREE.Scene();
  ThreeCamera = new THREE.PerspectiveCamera( GameplayCameraData.value, 320 / 240, 0.1, 1000 );
  ThreeRenderer = new THREE.WebGLRenderer( { alpha: false } );
  ThreeRenderer.setSize(320, 240);

  document.body.appendChild( ThreeRenderer.domElement );

  ThreeJSCanvas = ThreeRenderer.domElement;

  var backgroundColor = new THREE.Color( 0x1e2d30 );
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

  var playerSprite = CharactersTexture.clone();
  playerSprite.needsUpdate = true;
  playerSprite.magFilter = THREE.NearestFilter;
  playerSprite.minFilter = THREE.NearestFilter;
  playerSprite.wrapS = playerSprite.wrapT = THREE.RepeatWrapping;
  playerSprite.repeat.set(32 / 256, 64 / 256);
  playerSprite.offset.x = 0 / 8;
  playerSprite.offset.y = 3 / 4;

  var geometry = new THREE.BoxGeometry( 32, 32, 32 );
  var spherePieces = 20;
  var sphere = new THREE.SphereBufferGeometry(player.targetPt.data.radius * 0.8, 8, 6, 0, 1 / spherePieces * Math.PI * 2, 0, 1.5);
  var circle = new THREE.CircleGeometry(player.targetPt.data.soundRange, 8);
  var material3 = new THREE.SpriteMaterial( { fog: true, map: playerSprite } );
 
  sprite = new THREE.Sprite(material3);
  sprite.scale.set(32, 64, 32);
  ThreeScene.add(sprite);
  player.data.threeSprite = sprite;

  var bloodMaterial = TileMaterialMap[57].clone();
  bloodMaterial.transparent = true;
  bloodMaterial.needsUpdate = true;
  var bloodGeometry = new THREE.PlaneGeometry( 32, 32, 1, 1 )
  player.data.bloods = [];
  for (var i = 0; i < 6; i++) {
    var particle = new THREE.Mesh( bloodGeometry, bloodMaterial );
    particle.scale.set(2.0, 2.0, 1.0);
    particle.position.set(400 + 32*i, 2000, 1500);
    particle.rotateY(Math.PI * Math.random() * 2);
    particle.rotateX(Math.PI * -0.5);
    ThreeScene.add(particle);
    player.data.bloods.push(particle);
  }

  target = new THREE.Group();
  for (var i = 0; i < spherePieces; i++) {
    var tChild = new THREE.Mesh(sphere, targetMaterial);
    tChild.rotateY(i / spherePieces * Math.PI * 2);
    target.add(tChild);
  }
  ThreeScene.add(target);

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
      } else if (item.type === "npc") {
        var wolfSpriteTexture = CharactersTexture.clone();
        wolfSpriteTexture.needsUpdate = true;
        wolfSpriteTexture.magFilter = THREE.NearestFilter;
        wolfSpriteTexture.minFilter = THREE.NearestFilter;
        wolfSpriteTexture.wrapS = wolfSpriteTexture.wrapT = THREE.RepeatWrapping;
        wolfSpriteTexture.repeat.set(32 / 256, 64 / 256);
        wolfSpriteTexture.offset.x = (item.properties.frame % 8) / 8;
        wolfSpriteTexture.offset.y = (3 - ~~(item.properties.frame / 8)) / 4;;

        var wolfSpriteMaterial = new THREE.SpriteMaterial( {fog: true, map: wolfSpriteTexture });

        var scaleFactor = item.properties.scale ? item.properties.scale : 1;
        var sprite = new THREE.Sprite(wolfSpriteMaterial);
        sprite.position.set(item.x, 15, item.y);
        sprite.center.y = 0;
        sprite.scale.set(32 * scaleFactor, 64 * scaleFactor, 32 * scaleFactor);
        ThreeScene.add(sprite);
      } else if (item.type === 'light') {
        console.log(Phaser.Color.hexToColor(item.properties.hue).color);
        var light = new THREE.PointLight(0x770000 , 5, 100, Number.MIN_VALUE * 5 );
        light.position.set(item.x, 32, item.y);
        ThreeScene.add(light);
      } else if (item.type === 'blood') {
        var blood = new THREE.Mesh( bloodGeometry, bloodMaterial );
        blood.scale.set(2.0, 2.0, 1.0);
        blood.position.set(item.x, 17, item.y);
        blood.rotateY(Math.PI * Math.random() * 2);
        blood.rotateX(Math.PI * -0.5);
        ThreeScene.add(blood);
      }
    }, this);
  }

  wolves.children.forEach(function (w) {
    var wolfSpriteTexture = CharactersTexture.clone();
    wolfSpriteTexture.needsUpdate = true;
    wolfSpriteTexture.magFilter = THREE.NearestFilter;
    wolfSpriteTexture.minFilter = THREE.NearestFilter;
    wolfSpriteTexture.wrapS = wolfSpriteTexture.wrapT = THREE.RepeatWrapping;
    wolfSpriteTexture.repeat.set(32 / 256, 64 / 256);
    wolfSpriteTexture.offset.x = 0 / 8;
    wolfSpriteTexture.offset.y = 3 / 4;

    var wolfSpriteMaterial = new THREE.SpriteMaterial( {fog: true, map: wolfSpriteTexture });
    wolfSpriteMaterial.color = new THREE.Color(0xDDAAAA);

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
    w.data.particles = [];

    for (var i = 0; i < 96; i++) {
      var particle = new THREE.Mesh( new THREE.PlaneGeometry( 4, 5, 1, 1 ), new THREE.MeshBasicMaterial({color: [0x1b2b32, 0x212c33, 0x3e343b, 0x2e2e36, 0x413b42][~~(5 * Math.random())], side: THREE.DoubleSide}) );
      particle.position.set(64 * i, 2000, 1250 + ~~(Math.random() * 250));
      w.data.particles.push(particle);
      ThreeScene.add(particle);
    }
  }, this);
};

var UpdateThreeScene = function (player, wolves) {
  ThreeCamera.position.x = (player.x + player.targetPt.x) / 2 - GameplayCameraData.zDist * Math.cos(GameplayCameraAngle);
  ThreeCamera.position.y = GameplayCameraData.yDist + GameplayCameraData.yPush;
  ThreeCamera.position.z = (player.y + player.targetPt.y) / 2 - GameplayCameraData.zDist * Math.sin(GameplayCameraAngle);
  ThreeCamera.lookAt((player.x + player.targetPt.x) / 2, 16, (player.y + player.targetPt.y) / 2);

  sprite.position.set(player.x, 42, player.y + 16);
  sprite.material.map.offset.x = (player.animations.frame % 8) / 8;
  sprite.material.map.offset.y = (3 - ~~(player.animations.frame / 8)) / 4;
  sprite.scale.set(player.animations.currentAnim.name === 'run_right' || player.animations.currentAnim.name === 'idle_right' || player.animations.currentAnim.name === 'idle_right_focus' ? -32 : 32, 64, 32);

  target.position.set(player.targetPt.x, 16.1, player.targetPt.y + 16);
  target.rotation.y = player.game.time.now / 700;
  var s = 0.8 + (Math.sin(player.game.time.now / 150) + 0.5) * 0.2;
  target.scale.set(s, s, s)
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

  targetMaterial.uniforms.time.value = player.game.time.now / 1000;
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

