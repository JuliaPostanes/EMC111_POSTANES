// ============================================================
//  Cruel King's Throne Room from BLOCKTALES in Roblox
// ============================================================


const T = THREE;

// ------------------------------------------------------------
// 1. SETTINGS
// ------------------------------------------------------------
const ROOM = {
  width: 90,
  depth: 30,
  height: 23,
  wallThickness: 0.2,
};
const SKY_COLOR = 0xcfeaf7;

// ------------------------------------------------------------
// 2. TEXTURE HELPERS (textures drawn)
// ------------------------------------------------------------
function makeTexture(width, height, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawFn(canvas.getContext('2d'), width, height);

  const texture = new T.CanvasTexture(canvas);
  texture.magFilter = T.NearestFilter;
  texture.minFilter = T.NearestFilter;
  texture.wrapS = texture.wrapT = T.RepeatWrapping;
  return texture;
}

function drawNoise(ctx, width, height, colors, cellSize) {
  for (let x = 0; x < width; x += cellSize) {
    for (let y = 0; y < height; y += cellSize) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }
}

// Brick pattern
function drawBricks(ctx, width, height) {
  const brickColors = ['#6a707b', '#62686f', '#717781'];

  ctx.fillStyle = '#4a505c';               // mortar
  ctx.fillRect(0, 0, width, height);

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const offset = row % 2 ? 8 : 0;
      ctx.fillStyle = brickColors[(row + col) % 3];
      ctx.fillRect(col * 16 + offset + 1, row * 16 + 1, 14, 14);
    }
  }
}

// ------------------------------------------------------------
// 3. TEXTURES
// ------------------------------------------------------------
const floorTexture = makeTexture(32, 32, (ctx, w, h) =>
  drawNoise(ctx, w, h, ['#1a2036', '#1f2740', '#171c30'], 4));
floorTexture.repeat.set(12, 8);

const iceWallTexture = makeTexture(32, 32, (ctx, w, h) =>
  drawNoise(ctx, w, h, ['#d4f4ff', '#6cdaff', '#fdfeff'], 4));
iceWallTexture.repeat.set(6, 4);

const brickTexture = makeTexture(64, 64, drawBricks);
brickTexture.repeat.set(5, 4);

// ------------------------------------------------------------
// 4. SCENE, CAMERA, RENDERER
// ------------------------------------------------------------
const scene = new T.Scene();
scene.background = new T.Color(SKY_COLOR);
scene.fog = new T.Fog(SKY_COLOR, 30, 70);

const camera = new T.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);

const renderer = new T.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const canvas = renderer.domElement;

// ------------------------------------------------------------
// 5. LIGHTS
// ------------------------------------------------------------

// Soft colored sky
const skyLight = new T.HemisphereLight(0xdff3ff, 0x8fb4d8, 0.95);
scene.add(skyLight);

// Sun
const sun = new T.DirectionalLight(0xfff6e5, 0.8);
sun.position.set(-8, 16, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, {
  left: -20, right: 20, top: 20, bottom: -20, far: 60,
});
scene.add(sun);

// Highlights for the ice
const iceGlowRight = new T.PointLight(0x7fd8ff, 1.2, 22);
iceGlowRight.position.set(8, 5, -7);
scene.add(iceGlowRight);

const iceGlowLeft = new T.PointLight(0x7fd8ff, 1.0, 22);
iceGlowLeft.position.set(-12, 5, -3);
scene.add(iceGlowLeft);

// ------------------------------------------------------------
// 6. MATERIALS
// ------------------------------------------------------------
// Stone Material
const stoneMaterial = new T.MeshLambertMaterial({ map: brickTexture });
// Glossy ice
const iceWallMaterial = new T.MeshPhongMaterial({
  map: iceWallTexture,
  color: 0xcdf1ff,
  shininess: 120,
  specular: 0xffffff,
  emissive: 0x2a7fb5,
  emissiveIntensity: 0.25,
});
const floorMaterial = new T.MeshPhongMaterial({
  map: floorTexture,
  shininess: 60,
  specular: 0x334466,
});


// ------------------------------------------------------------
// 7. BUILDING HELPER
// ------------------------------------------------------------

// Box
function addBox(width, height, depth, material, x, y, z, castShadow = true) {
  const mesh = new T.Mesh(new T.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

// ------------------------------------------------------------
// 8. THE ROOM [floors and walls]
// ------------------------------------------------------------
const t = ROOM.wallThickness;
const wallY = ROOM.height / 2;
const sideWallX = ROOM.width / 2 + t / 2;
const backWallZ = -ROOM.depth / 2 - t / 2;

// Floor
addBox(ROOM.width, 0.2, ROOM.depth, floorMaterial, 0, 0.1, 0, false);

// Side Wall
addBox(t, ROOM.height, ROOM.depth, iceWallMaterial,  sideWallX, wallY, 0);

// Back wall
const backLength = ROOM.width + 2 * t;
const leftEdge = -backLength / 2;
const stoneWidth = backLength * 0.53;
const iceWidth = backLength - stoneWidth;


// ------------------------------------------------------------
// 9. PILLARS
// ------------------------------------------------------------

const PILLAR = {
  size: 2,
  baseHeight: 0.8,
  capHeight: 0.8,
};
 
// Pillars
const pillarTexture = makeTexture(32, 32, (ctx, w, h) =>
  drawNoise(ctx, w, h, ['#bfe9ff', '#cdf1ff', '#aee0f8'], 4));
pillarTexture.repeat.set(1, 4);
 
const pillarMaterial = new T.MeshPhongMaterial({
  map: pillarTexture,
  color: 0xcdf1ff,
  transparent: true,
  opacity: 0.85,
  shininess: 120,
  specular: 0xffffff,
  emissive: 0x2a7fb5,
  emissiveIntensity: 0.2,
});

// Brick pillars
const brickPillarTexture = makeTexture(64, 64, drawBricks);
brickPillarTexture.repeat.set(0.5, 3);

const brickPillarMaterial = new T.MeshLambertMaterial({ map: brickPillarTexture });

function addPillar(x, z, material) {
  const shaft = PILLAR.size;
  const wide = PILLAR.size * 1.4;
  const shaftHeight = ROOM.height - PILLAR.baseHeight - PILLAR.capHeight;

  addBox(wide, PILLAR.baseHeight, wide, material,
         x, PILLAR.baseHeight / 2, z);
  addBox(shaft, shaftHeight, shaft, material,
         x, PILLAR.baseHeight + shaftHeight / 2, z);
  addBox(wide, PILLAR.capHeight, wide, material,
         x, ROOM.height - PILLAR.capHeight / 2, z);
}
 
// Pillar positions
const insetX = ROOM.width / 2 - PILLAR.size * 0.8;
const insetZ = ROOM.depth / 2 - PILLAR.size * 0.8;
 
const pillarSpots = [
  [-insetX, -insetZ, brickPillarMaterial],
  [ insetX, -insetZ, pillarMaterial],
  [-insetX,  insetZ, brickPillarMaterial],
  [ insetX,  insetZ, pillarMaterial],
  [-12, -14, brickPillarMaterial],
  [2.7, -14, brickPillarMaterial]
];

pillarSpots.forEach(([x, z, material]) => addPillar(x, z, material));


// ------------------------------------------------------------
// 9b. Ice Banner and Candelabra
// ------------------------------------------------------------
const wallFaceZ = backWallZ + t / 2;
const decorX = (-12 + 2.7) / 2;

// Ice banner
function drawSnowflake(ctx, cx, cy, r, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(i * Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);       ctx.lineTo(0, -r);
    ctx.moveTo(0, -r * 0.55); ctx.lineTo(-r * 0.25, -r * 0.82);
    ctx.moveTo(0, -r * 0.55); ctx.lineTo( r * 0.25, -r * 0.82);
    ctx.stroke();
    ctx.restore();
  }
}

function drawBanner(ctx, w, h) {
  const hexagon = (inset) => {
    ctx.beginPath();
    ctx.moveTo(w / 2, inset);
    ctx.lineTo(w - inset, h * 0.22);
    ctx.lineTo(w - inset, h * 0.78);
    ctx.lineTo(w / 2, h - inset);
    ctx.lineTo(inset, h * 0.78);
    ctx.lineTo(inset, h * 0.22);
    ctx.closePath();
  };

  hexagon(1); ctx.fillStyle = '#0f1b33'; ctx.fill();   // dark outline
  hexagon(3); ctx.fillStyle = '#ffffff'; ctx.fill();   // white rim
  hexagon(6); ctx.fillStyle = '#6fd0f5'; ctx.fill();   // blue panel

  ctx.save();
  hexagon(6);
  ctx.clip();
  for (let x = 0; x < w; x += 3) {
    for (let y = 0; y < h; y += 3) {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.random() * 0.3 + ')';
      ctx.fillRect(x, y, 3, 3);
    }
  }
  ctx.restore();

  drawSnowflake(ctx, w / 2, h / 2, 19, '#ffffff', 3);
}

const bannerTexture = makeTexture(48, 72, drawBanner);

const banner = new T.Mesh(
  new T.PlaneGeometry(12, 18),
  new T.MeshBasicMaterial({ map: bannerTexture, transparent: true, alphaTest: 0.1 })
);
banner.position.set(decorX, 11, wallFaceZ + 0.06);   // just in front of the wall
scene.add(banner);



// Candelabra
const goldMaterial = new T.MeshPhongMaterial({
  color: 0xe8b830,
  shininess: 120,
  specular: 0xfff2a0,
});
const candleMaterial = new T.MeshPhongMaterial({ color: 0xf5ead0 });
const flameMaterial = new T.MeshBasicMaterial({ color: 0xffa42b });

const candleFlames = [];

function addCandelabra(x, z, scale) {
  const group = new T.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);
  scene.add(group);

  const block = (w, h, d, material, px, py) => {
    const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), material);
    mesh.position.set(px, py, 0);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  };

  // Stepped base
  block(1.6, 0.25, 1.0, goldMaterial, 0, 0.125);
  block(1.0, 0.25, 0.7, goldMaterial, 0, 0.375);

  // Center stem
  block(0.25, 2.7, 0.25, goldMaterial, 0, 1.75);

  // Arms
  block(1.8, 0.2, 0.25, goldMaterial, 0, 2.7);
  block(0.2, 0.5, 0.25, goldMaterial, -0.8, 2.95);
  block(0.2, 0.5, 0.25, goldMaterial,  0.8, 2.95);

  // Candles
  const candles = [
    { x: -0.8, y: 3.4, h: 1 },   // left
    { x:  0,   y: 3.6, h: 1 },   // middle
    { x:  0.8, y: 3.4, h: 1 },   // right
  ];

  candles.forEach(({ x: cx, y: cy, h }) => {
    block(0.25, h, 0.25, candleMaterial, cx, cy);
    candleFlames.push(block(0.14, 0.24, 0.14, flameMaterial, cx, cy + h / 2 + 0.12));
  });
}


addCandelabra(decorX, wallFaceZ + 1.2, 1.8);

// Warm light
const candleLight = new T.PointLight(0xffb35a, 1.2, 25);
candleLight.position.set(decorX, 6, wallFaceZ + 2);
scene.add(candleLight);

// ------------------------------------------------------------
// 9c. WINDOW
// ------------------------------------------------------------
const WINDOW = {
  width:18,
  height: 21,
  x: 16,
  pointedTop: true,

  glassTop: '#d6f4ff',
  glassBottom: '#7fd0f5',
  glassOpacity: 0.7,

  lightColor: 0xbfeaff,
  lightStrength: 1.6,
};

// Soft textures
function makeSoftTexture(width, height, drawFn) {
  const texture = makeTexture(width, height, drawFn);
  texture.magFilter = T.LinearFilter;
  texture.minFilter = T.LinearFilter;
  return texture;
}

function drawWindow(ctx, w, h) {
  const outline = (inset) => {
    ctx.beginPath();
    ctx.moveTo(inset, h);
    ctx.lineTo(inset, WINDOW.pointedTop ? h * 0.42 : inset);
    if (WINDOW.pointedTop) ctx.lineTo(w / 2, inset);
    ctx.lineTo(w - inset, WINDOW.pointedTop ? h * 0.42 : inset);
    ctx.lineTo(w - inset, h);
    ctx.closePath();
  };

  // Frame
  outline(0.5); ctx.fillStyle = '#6a7390'; ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  outline(3); ctx.fill();
  ctx.restore();

  // Glass
  const glass = ctx.createLinearGradient(0, 0, 0, h);
  glass.addColorStop(0, WINDOW.glassTop);
  glass.addColorStop(1, WINDOW.glassBottom);
  ctx.save();
  ctx.globalAlpha = WINDOW.glassOpacity;
  outline(3); ctx.fillStyle = glass; ctx.fill();
  ctx.restore();

  drawSnowflake(ctx, w / 2, h * 0.68, 11, 'rgba(255, 255, 255, 0.85)', 2);
}

// Basic material
const windowMaterial = new T.MeshBasicMaterial({
  map: makeTexture(48, 80, drawWindow),
  transparent: true,
  depthWrite: false,
});

const windowY = WINDOW.height / 2 + 0.2;

const iceWindow = new T.Mesh(
  new T.PlaneGeometry(WINDOW.width, WINDOW.height),
  windowMaterial
);
iceWindow.position.set(WINDOW.x, windowY, wallFaceZ + 0.05);
scene.add(iceWindow);

// Glow around the window
const glowTexture = makeSoftTexture(64, 64, (ctx) => {
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  g.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
});

const windowGlow = new T.Mesh(
  new T.PlaneGeometry(WINDOW.width + 4, WINDOW.height + 4),
  new T.MeshBasicMaterial({
    map: glowTexture,
    color: WINDOW.lightColor,
    transparent: true,
    opacity: 0.45,
    blending: T.AdditiveBlending,
    depthWrite: false,
  })
);
windowGlow.position.set(WINDOW.x, windowY, wallFaceZ + 0.03);
scene.add(windowGlow);

// Patch of light on the floor
const floorLightTexture = makeSoftTexture(32, 64, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  g.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
});

const floorLight = new T.Mesh(
  new T.PlaneGeometry(WINDOW.width * 1.2, 14),
  new T.MeshBasicMaterial({
    map: floorLightTexture,
    color: WINDOW.lightColor,
    transparent: true,
    opacity: 0.5,
    blending: T.AdditiveBlending,
    depthWrite: false,
  })
);
floorLight.rotation.x = -Math.PI / 2;
floorLight.position.set(WINDOW.x, 0.22, wallFaceZ + 7);
scene.add(floorLight);
const windowLight = new T.PointLight(WINDOW.lightColor, WINDOW.lightStrength, 30);
windowLight.position.set(WINDOW.x, 6, wallFaceZ + 3);
scene.add(windowLight);

// ------------------------------------------------------------
// 9d. ICE STAIRCASE
// ------------------------------------------------------------
const STAIRS = {
  z: 0.2,
  width: 29.8,
  steps: 6,
  stepHeight: 0.7,
  stepDepth: 1.5,
  platformDepth: 20,
  distanceFromWall: 0,
};

// Glassy ice texture for the steps
const stairTexture = makeTexture(32, 32, (ctx, w, h) =>
  drawNoise(ctx, w, h, ['#e9fbff', '#d6f4ff', '#f4fdff'], 4));
stairTexture.repeat.set(4, 1);

// Two slightly different shades, used on alternate steps so each step stands out
const stairMaterials = [0xe6f8ff, 0xc9ecfb].map((color) =>
  new T.MeshPhongMaterial({
    map: stairTexture,
    color: color,
    shininess: 100,
    specular: 0xffffff,
    emissive: 0x4aa8d8,
    emissiveIntensity: 0.2,
  })
);

function addStaircase() {
  const wallX = ROOM.width / 2 - STAIRS.distanceFromWall;
  const stepsLength = STAIRS.steps * STAIRS.stepDepth;
  const frontX = wallX - STAIRS.platformDepth - stepsLength;

  for (let i = 0; i < STAIRS.steps; i++) {
    const height = (i + 1) * STAIRS.stepHeight;
    const x = frontX + (i + 0.5) * STAIRS.stepDepth;
    addBox(STAIRS.stepDepth, height, STAIRS.width, stairMaterials[i % 2],
           x, height / 2, STAIRS.z);
  }

  // Flat platform at the top
  const topHeight = (STAIRS.steps + 1) * STAIRS.stepHeight;
  addBox(STAIRS.platformDepth, topHeight, STAIRS.width, stairMaterials[STAIRS.steps % 2],
         wallX - STAIRS.platformDepth / 2, topHeight / 2, STAIRS.z);
}

addStaircase();


// ------------------------------------------------------------
// 9e. ICE SPIKES
// ------------------------------------------------------------

// One shared material for every spike
const iceSpikeMaterial = new T.MeshPhongMaterial({
  color: 0xbfe9ff,
  transparent: true,
  opacity: 0.85,
  shininess: 150,
  specular: 0xffffff,
  emissive: 0x2a7fb5,
  emissiveIntensity: 0.25,
  flatShading: true,
});

// The ice object
function addIceSpike(x, z, height = 4, radius = 1) {
  const spike = new T.Mesh(
    new T.ConeGeometry(radius, height, 6),
    iceSpikeMaterial
  );
  spike.position.set(x, 0.2 + height / 2, z);
  spike.rotation.y = Math.random() * Math.PI;
  spike.castShadow = true;
  spike.receiveShadow = true;
  scene.add(spike);
  return spike;
}

// Arrangement [x, z, height, radius]
const iceSpikeSpots = [
  [-20, -10, 5.0, 1.2],
  [-17,  -6, 2.5, 0.8],
  [-24,  -4, 3.5, 1.0],
  [ 10,   8, 1.5, 0.6],
  [ 11, -10, 6.0, 1.0],
  [ 5, -9.5, 4.5, 1.4],
  [ 12,  13, 4.5, 1.4],
  [ 2,   12, 1.8, 0.6],
  [ -21, 9, 6.2, 1.8],
  [ -15, 11, 2.5, 1.2],
  [ 4, 9, 5, 1.3],

];

iceSpikeSpots.forEach(([x, z, height, radius]) => addIceSpike(x, z, height, radius));

// ------------------------------------------------------------
// 9e-2. RANDOM ICE SPIKES (scattered)
// ------------------------------------------------------------
const RANDOM_SPIKES = {
  count: 11,
  seed: 7,
  area: { xMin: -42, xMax: -2, zMin: -12.5, zMax: 12.5 },
  height: [1.5, 7],
  radiusPerHeight: [0.14, 0.28],
  minGap: 3,
  keepClear: { xMax: -34, zHalf: 11 },
};

function makeRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const random = makeRandom(RANDOM_SPIKES.seed);
const between = (low, high) => low + random() * (high - low);


const placedSpikes = iceSpikeSpots.map(([x, z]) => [x, z]);

let randomSpikesAdded = 0;
let attempts = 0;

while (randomSpikesAdded < RANDOM_SPIKES.count && attempts < 2000) {
  attempts++;

  const x = between(RANDOM_SPIKES.area.xMin, RANDOM_SPIKES.area.xMax);
  const z = between(RANDOM_SPIKES.area.zMin, RANDOM_SPIKES.area.zMax);

  // Skip the spot if it blocks the doorway
  if (x < RANDOM_SPIKES.keepClear.xMax && Math.abs(z) < RANDOM_SPIKES.keepClear.zHalf) continue;

  // Skip the spot if it's too close to another spike
  const tooClose = placedSpikes.some(([px, pz]) =>
    Math.hypot(px - x, pz - z) < RANDOM_SPIKES.minGap);
  if (tooClose) continue;

  const height = between(RANDOM_SPIKES.height[0], RANDOM_SPIKES.height[1]);
  const radius = height * between(RANDOM_SPIKES.radiusPerHeight[0], RANDOM_SPIKES.radiusPerHeight[1]);

  addIceSpike(x, z, height, radius);
  placedSpikes.push([x, z]);
  randomSpikesAdded++;
}

// ------------------------------------------------------------
// 9f. ICE THRONE
// ------------------------------------------------------------
const THRONE = {
  scale: 1,
  gap: 9,
  slide: 0,
};

// Pale glassy ice for the throne
const throneTexture = makeTexture(32, 32, (ctx, w, h) =>
  drawNoise(ctx, w, h, ['#e9fbff', '#d6f4ff', '#f4fdff'], 4));

const throneMaterial = new T.MeshPhongMaterial({
  map: throneTexture,
  color: 0xcdf1ff,
  shininess: 120,
  specular: 0xffffff,
  emissive: 0x4aa8d8,
  emissiveIntensity: 0.2,
});

// Builds one throne
function addThrone(x, y, z, rotationY, scale) {
  const group = new T.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  group.scale.setScalar(scale);
  scene.add(group);

  const block = (w, h, d, px, py, pz) => {
    const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), throneMaterial);
    mesh.position.set(px, py, pz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  };

  block(4, 1.2, 3.2, 0, 0.6, 0);               // seat
  block(4, 6, 0.8, 0, 4.2, -1.2);              // backrest
  block(4.6, 0.5, 1.2, 0, 7.45, -1.2);         // cap on top of the backrest
  block(0.8, 2.4, 3.2, -2.4, 1.2, 0);          // left armrest
  block(0.8, 2.4, 3.2,  2.4, 1.2, 0);          // right armrest
}

// Placing the throne
const platformTop = (STAIRS.steps + 1) * STAIRS.stepHeight;
const throneOffset = THRONE.gap + 1.8 * THRONE.scale;

if (STAIRS.x !== undefined) {
  const backZ = wallFaceZ + (STAIRS.distanceFromWall || 0);
  addThrone(STAIRS.x + THRONE.slide, platformTop, backZ + throneOffset, 0, THRONE.scale);
} else {
  const wallX = ROOM.width / 2 - (STAIRS.distanceFromWall || 0);
  addThrone(wallX - throneOffset, platformTop, STAIRS.z + THRONE.slide, -Math.PI / 2, THRONE.scale);
}


// ------------------------------------------------------------
// 9g. ICE CUBES (behind the throne)
// ------------------------------------------------------------
const ICE_CUBES = {
  offsetX: 0,    // move ALL the cubes together: + = toward the right wall, - = toward the room
  offsetZ: 0,    // move ALL the cubes together: + = toward the front, - = toward the back wall
};

// Glassy, slightly see-through ice for the cubes
const iceCubeTexture = makeTexture(32, 32, (ctx, w, h) =>
  drawNoise(ctx, w, h, ['#d6f4ff', '#bfe9ff', '#e9fbff'], 4));

const iceCubeMaterial = new T.MeshPhongMaterial({
  map: iceCubeTexture,
  color: 0xcdf1ff,
  transparent: true,
  opacity: 0.9,
  shininess: 150,
  specular: 0xffffff,
  emissive: 0x2a7fb5,
  emissiveIntensity: 0.25,
});

// The ice cube
//   x, z  = position on the platform
//   size  = width, height and depth of the cube
//   lift  = how high above the platform it starts
function addIceCube(x, z, size = 2, lift = 0) {
  const cube = new T.Mesh(new T.BoxGeometry(size, size, size), iceCubeMaterial);
  cube.position.set(
    x + ICE_CUBES.offsetX,
    platformTop + lift + size / 2,
    z + ICE_CUBES.offsetZ
  );
  cube.castShadow = true;
  cube.receiveShadow = true;
  scene.add(cube);
  return cube;
}

// Arrangement [x, z, size, lift]
const iceCubeSpots = [
  [38.0, -2.0, 3.0, 0],
  [38.0,  2.5, 2.0, 0],
  [42.0,  0.0, 4.0, 0],
  [42.0,  0.0, 2.0, 4],
  [38.5, -6.0, 2.5, 0],
  [40.0,  6.0, 3.0, 0],
  [40.0, 9.0, 5.0, 0],
  [40.0, -9.0, 5.0, 0],
  [35, -10.5, 4.3, 0],

];

iceCubeSpots.forEach(([x, z, size, lift]) => addIceCube(x, z, size, lift));


// ------------------------------------------------------------
// 9h. SPIKES ON THE PLATFORM (and on top of cubes)
// ------------------------------------------------------------
const PLATFORM_SPIKES = {
  offsetX: 0,
  offsetZ: 0,
};

// Same look as the floor spikes but placed on the platform.
//   x, z    = position
//   lift    = height above the platform
function addPlatformSpike(x, z, height = 3, radius = 0.8, lift = 0) {
  const spike = new T.Mesh(
    new T.ConeGeometry(radius, height, 6),
    iceSpikeMaterial
  );
  spike.position.set(
    x + PLATFORM_SPIKES.offsetX,
    platformTop + lift + height / 2,
    z + PLATFORM_SPIKES.offsetZ
  );
  spike.rotation.y = Math.random() * Math.PI;
  spike.castShadow = true;
  spike.receiveShadow = true;
  scene.add(spike);
  return spike;
}

// Row per Spike [x, z, height, radius, lift]
const platformSpikeSpots = [
  [28, -10, 6.0, 2, 0],
  [30,  11, 3.0, 0.9, 0],
  [43, -11, 5.0, 1.3, 0],
  [43,  11, 4.5, 1.2, 0],

  // on top of the cubes
  [38.0, -2.0, 2.0, 0.6, 3],
  [42.0,  0.0, 2.5, 0.5, 6],
  [40.0,  6.0, 2.0, 0.6, 3],
  [38, -10, 10, 2, 3],
  [40, 9.5, 10, 2, 3],
];



platformSpikeSpots.forEach(([x, z, height, radius, lift]) =>
  addPlatformSpike(x, z, height, radius, lift));


// ------------------------------------------------------------
// 9i. FROST (ice spreading from the platform)
// ------------------------------------------------------------
const FROST = {
  // Where the ice starts
  sourceX: ROOM.width / 2 - STAIRS.distanceFromWall - STAIRS.platformDepth
           - STAIRS.steps * STAIRS.stepDepth,
  spread: 35,        // how far the ice reaches across the floor
  threshold: 0.25,
  roughness: 0.9,
  seed: 1,
};

function frostHash(a, b) {
  const n = Math.sin(a * 127.1 + b * 311.7 + FROST.seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

// Frost
function drawFrost(ctx, w, h) {
  const cell = 2;   // size of each ice
  const iceColors = ['#e9fbff', '#d6f4ff', '#f4fdff', '#c4ecfb'];

  for (let py = 0; py < h; py += cell) {
    for (let px = 0; px < w; px += cell) {
      const worldX = -ROOM.width / 2 + (px / w) * ROOM.width;
      const distance = FROST.sourceX - worldX;       // distance from the stairs
      if (distance < 0) continue;                    // no frost under the stairs

      const coverage = 1 - distance / FROST.spread;  // coverage

      const lumps = frostHash(Math.floor(px / 8), Math.floor(py / 8)) * 0.6
                  + frostHash(px / cell, py / cell) * 0.4;
      const strength = coverage + (lumps - 0.5) * FROST.roughness;

      if (strength > FROST.threshold) {
        // Colors
        ctx.fillStyle = strength < FROST.threshold + 0.12
          ? '#9fd8f0'
          : iceColors[Math.floor(frostHash(px, py) * iceColors.length)];
        ctx.fillRect(px, py, cell, cell);
      }
    }
  }
}

const frostMaterial = new T.MeshPhongMaterial({
  map: makeTexture(ROOM.width * 2, ROOM.depth * 2, drawFrost),
  transparent: true,
  shininess: 80,
  specular: 0xffffff,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -1,
});

const frostPatch = new T.Mesh(
  new T.PlaneGeometry(ROOM.width, ROOM.depth),
  frostMaterial
);
frostPatch.rotation.x = -Math.PI / 2;
frostPatch.position.set(0, 0.23, 0);
frostPatch.receiveShadow = true;
scene.add(frostPatch);


// ------------------------------------------------------------
// 9j. EXTRA WINDOWS
// ------------------------------------------------------------

function makeWindowTexture(width, height, pointedTop, showSnowflake) {
  return makeTexture(Math.round(width * 6), Math.round(height * 6), (ctx, w, h) => {
    // Window outline
    const outline = (inset) => {
      ctx.beginPath();
      ctx.moveTo(inset, h - inset);
      ctx.lineTo(inset, pointedTop ? h * 0.42 : inset);
      if (pointedTop) ctx.lineTo(w / 2, inset);
      ctx.lineTo(w - inset, pointedTop ? h * 0.42 : inset);
      ctx.lineTo(w - inset, h - inset);
      ctx.closePath();
    };

    // Frame
    outline(0.5); ctx.fillStyle = '#6a7390'; ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    outline(3); ctx.fill();
    ctx.restore();

    // Glass
    const glass = ctx.createLinearGradient(0, 0, 0, h);
    glass.addColorStop(0, WINDOW.glassTop);
    glass.addColorStop(1, WINDOW.glassBottom);
    ctx.save();
    ctx.globalAlpha = WINDOW.glassOpacity;
    outline(3); ctx.fillStyle = glass; ctx.fill();
    ctx.restore();

    if (showSnowflake) {
      drawSnowflake(ctx, w / 2, h * (pointedTop ? 0.66 : 0.5), Math.min(w, h) * 0.22,
                    'rgba(255, 255, 255, 0.85)', 2);
    }
  });
}


function addIceWindow({ x, width, height, bottom, pointedTop, snowflake, light = true }) {
  const y = bottom + height / 2;       // center of the window

  // Glass + frame
  const glass = new T.Mesh(
    new T.PlaneGeometry(width, height),
    new T.MeshBasicMaterial({
      map: makeWindowTexture(width, height, pointedTop, snowflake),
      transparent: true,
      depthWrite: false,
    })
  );
  glass.position.set(x, y, wallFaceZ + 0.05);
  scene.add(glass);

  // Glow around the window
  const glow = new T.Mesh(
    new T.PlaneGeometry(width + 4, height + 4),
    new T.MeshBasicMaterial({
      map: glowTexture,
      color: WINDOW.lightColor,
      transparent: true,
      opacity: 0.45,
      blending: T.AdditiveBlending,
      depthWrite: false,
    })
  );
  glow.position.set(x, y, wallFaceZ + 0.03);
  scene.add(glow);

  // Patch of light on the floor in front of the window
  const floorGlow = new T.Mesh(
    new T.PlaneGeometry(width * 1.2, 14),
    new T.MeshBasicMaterial({
      map: floorLightTexture,
      color: WINDOW.lightColor,
      transparent: true,
      opacity: 0.5,
      blending: T.AdditiveBlending,
      depthWrite: false,
    })
  );
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.set(x, 0.22, wallFaceZ + 7);
  scene.add(floorGlow);

  // Real light shining into the room
  if (light) {
    const windowLight = new T.PointLight(WINDOW.lightColor, WINDOW.lightStrength, 30);
    windowLight.position.set(x, y, wallFaceZ + 3);
    scene.add(windowLight);
  }
}

// The window on the left side of the back wall
addIceWindow({
  x: -28,
  width: 12,
  height: 19,
  bottom: 3,
  pointedTop: true,
  snowflake: false,
});

// ------------------------------------------------------------
// 9k. CORRIDOR
// ------------------------------------------------------------
const CORRIDOR = {
  z: 0,
  doorWidth: 20,
  doorHeight: 10,
  length: 24,
  wallThickness: 2,
  columnEvery: 6,
  lights: 3,
  candelabras: true,
};

const halfDoor = CORRIDOR.doorWidth / 2;
const archSteps = halfDoor;
const openingHeight = CORRIDOR.doorHeight + archSteps - 1;
const corridorHeight = openingHeight + 1; 
const frameWidth = 1.5;
const leftWallX = -sideWallX;
const corridorStartX = -ROOM.width / 2 - t - 0.6;
const corridorEndX = corridorStartX - CORRIDOR.length;
const doorBackZ = CORRIDOR.z - halfDoor;
const doorFrontZ = CORRIDOR.z + halfDoor;


function tiledMaterial(base, repeatX, repeatY) {
  const material = base.clone();
  material.map = base.map.clone();
  material.map.needsUpdate = true;
  material.map.repeat.set(repeatX, repeatY);
  return material;
}

function addLeftWallSlab(material, tileU, tileV, zFrom, zTo, yFrom, yTo, depthX) {
  const sizeZ = zTo - zFrom;
  const sizeY = yTo - yFrom;
  if (sizeZ <= 0 || sizeY <= 0) return;
  addBox(depthX, sizeY, sizeZ, tiledMaterial(material, sizeZ / tileU, sizeY / tileV),
         leftWallX, (yFrom + yTo) / 2, (zFrom + zTo) / 2);
}

// Left wall with a gap for the frame
const wallBackZ = -ROOM.depth / 2;
const wallFrontZ = ROOM.depth / 2;

addLeftWallSlab(iceWallMaterial, 5, 5.75, wallBackZ, doorBackZ, 0, ROOM.height, t);         // beside the door
addLeftWallSlab(iceWallMaterial, 5, 5.75, doorFrontZ, wallFrontZ, 0, ROOM.height, t);       // beside the door
addLeftWallSlab(iceWallMaterial, 5, 5.75, doorBackZ, doorFrontZ, openingHeight + 1, ROOM.height, t); // above the door

// Stone frame
const frameDepth = t + 1.2;
const stoneSlab = (zFrom, zTo, yFrom, yTo) =>
  addLeftWallSlab(stoneMaterial, 9.8, 5.75, zFrom, zTo, yFrom, yTo, frameDepth);

stoneSlab(doorBackZ - frameWidth, doorBackZ, 0, CORRIDOR.doorHeight);
stoneSlab(doorFrontZ, doorFrontZ + frameWidth, 0, CORRIDOR.doorHeight);

for (let k = 0; k < archSteps; k++) {
  const y0 = CORRIDOR.doorHeight + k;
  const half = halfDoor - (k + 1);
  if (half > 0) {
    stoneSlab(doorBackZ - frameWidth, CORRIDOR.z - half, y0, y0 + 1);
    stoneSlab(CORRIDOR.z + half, doorFrontZ + frameWidth, y0, y0 + 1);
  } else {
    stoneSlab(doorBackZ - frameWidth, doorFrontZ + frameWidth, y0, y0 + 1);
  }
}

addLeftWallSlab(stoneMaterial, 9.8, 5.75,
                doorBackZ - frameWidth - 0.5, doorFrontZ + frameWidth + 0.5,
                openingHeight + 1, openingHeight + 1.6, frameDepth + 0.6);

// THE CORRIDOR
const corridorWidth = CORRIDOR.doorWidth + 2 * CORRIDOR.wallThickness;
const corridorMidX = (corridorStartX + corridorEndX) / 2;

// Floor
const floorStartX = -ROOM.width / 2;
const floorLength = floorStartX - corridorEndX;
addBox(floorLength, 0.2, corridorWidth,
       tiledMaterial(floorMaterial, floorLength / 7.5, corridorWidth / 3.75),
       (floorStartX + corridorEndX) / 2, 0.1, CORRIDOR.z, false);

// Side walls
for (const side of [-1, 1]) {
  addBox(CORRIDOR.length, corridorHeight, CORRIDOR.wallThickness,
         tiledMaterial(stoneMaterial, CORRIDOR.length / 9.8, corridorHeight / 5.75),
         corridorMidX, corridorHeight / 2, CORRIDOR.z + side * (halfDoor + CORRIDOR.wallThickness / 2));
}

// Ceiling
addBox(CORRIDOR.length, 1, corridorWidth,
       tiledMaterial(stoneMaterial, CORRIDOR.length / 9.8, corridorWidth / 9.8),
       corridorMidX, corridorHeight + 0.5, CORRIDOR.z);

// End wall + a glowing panel, so the corridor ends in light
addBox(1, corridorHeight + 1, corridorWidth,
       tiledMaterial(stoneMaterial, corridorWidth / 9.8, (corridorHeight + 1) / 5.75),
       corridorEndX - 0.5, (corridorHeight + 1) / 2, CORRIDOR.z);

const endPanel = new T.Mesh(
  new T.PlaneGeometry(CORRIDOR.doorWidth - 2, openingHeight - 2),
  new T.MeshBasicMaterial({ color: 0xeafaff, transparent: true, opacity: 0.95 })
);
endPanel.rotation.y = Math.PI / 2;
endPanel.position.set(corridorEndX + 0.05, openingHeight / 2 + 0.2, CORRIDOR.z);
scene.add(endPanel);

const endGlow = new T.Mesh(
  new T.PlaneGeometry(CORRIDOR.doorWidth + 4, openingHeight + 4),
  new T.MeshBasicMaterial({
    map: glowTexture, color: 0xbfeaff, transparent: true, opacity: 0.6,
    blending: T.AdditiveBlending, depthWrite: false,
  })
);
endGlow.rotation.y = Math.PI / 2;
endGlow.position.set(corridorEndX + 0.1, openingHeight / 2 + 0.2, CORRIDOR.z);
scene.add(endGlow);

// Carpet runner
const runnerStartX = corridorEndX + 1;
const runnerEndX = -ROOM.width / 2 + 8;
const runnerMaterial = new T.MeshPhongMaterial({ color: 0xbfe9ff, shininess: 80, specular: 0xffffff });
addBox(runnerEndX - runnerStartX, 0.04, 3, runnerMaterial,
       (runnerStartX + runnerEndX) / 2, 0.22, CORRIDOR.z, false);

// Ice columns along both walls
const columnZ = halfDoor - 0.5;
for (let x = corridorStartX - 3; x > corridorEndX + 1; x -= CORRIDOR.columnEvery) {
  for (const side of [-1, 1]) {
    const z = CORRIDOR.z + side * columnZ;
    addBox(1.4, 0.6, 1.4, pillarMaterial, x, 0.5, z);                                     // base
    addBox(1, corridorHeight - 1.4, 1, pillarMaterial, x, 0.8 + (corridorHeight - 1.4) / 2, z); // shaft
    addBox(1.4, 0.6, 1.4, pillarMaterial, x, corridorHeight - 0.3, z);                    // cap
  }
}

// Soft lights along the ceiling
for (let i = 1; i <= CORRIDOR.lights; i++) {
  const x = corridorStartX - (CORRIDOR.length * i) / (CORRIDOR.lights + 1);

  const lamp = new T.PointLight(0xaee4ff, 1.1, 16);
  lamp.position.set(x, corridorHeight - 3, CORRIDOR.z);
  scene.add(lamp);

  if (CORRIDOR.candelabras) {
    addCandelabra(x, CORRIDOR.z - (halfDoor - 1.5), 1.2);
    addCandelabra(x, CORRIDOR.z + (halfDoor - 1.5), 1.2);
  }
}


// ------------------------------------------------------------
// 9l. BACK WALL WITH WINDOW OPENINGS
// ------------------------------------------------------------

const WINDOW_OPENINGS = [
  { x: WINDOW.x, width: WINDOW.width, height: WINDOW.height, bottom: 0.2, pointedTop: WINDOW.pointedTop },
  { x: -28,      width: 12,           height: 19,            bottom: 3,   pointedTop: true },
];

const OPENING_INSET = 0.5;

function openingHalfWidth(w, y) {
  if (y < w.bottom || y > w.bottom + w.height) return 0;
  const half = w.width / 2;
  if (!w.pointedTop) return half - OPENING_INSET;

  const shoulder = w.bottom + w.height * 0.58;
  if (y <= shoulder) return half - OPENING_INSET;
  const up = (y - shoulder) / (w.bottom + w.height - shoulder);
  return half * (1 - up) - OPENING_INSET;
}


function addWorldUVBox(x0, x1, y0, y1, material, tileU, tileV) {
  const geometry = new T.BoxGeometry(x1 - x0, y1 - y0, t);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const uv = geometry.attributes.uv;

  for (let i = 0; i < position.count; i++) {
    const wx = position.getX(i) + cx;
    const wy = position.getY(i) + cy;
    const wz = position.getZ(i) + backWallZ;
    const nx = Math.abs(normal.getX(i));
    const ny = Math.abs(normal.getY(i));
    const nz = Math.abs(normal.getZ(i));

    if (nz >= nx && nz >= ny) uv.setXY(i, wx / tileU, wy / tileV);   // front and back faces
    else if (nx >= ny)        uv.setXY(i, wz / tileU, wy / tileV);   // left and right faces
    else                      uv.setXY(i, wx / tileU, wz / tileU);   // top and bottom faces
  }
  uv.needsUpdate = true;

  const mesh = new T.Mesh(geometry, material);
  mesh.position.set(cx, cy, backWallZ);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

const backStoneMaterial = tiledMaterial(stoneMaterial, 1, 1);
const backIceMaterial = tiledMaterial(iceWallMaterial, 1, 1);
const backWallSplitX = leftEdge + stoneWidth;

function addBackWallPiece(a, b, y0, y1) {
  if (b - a < 0.01) return;
  if (a < backWallSplitX && b > backWallSplitX) {
    addBackWallPiece(a, backWallSplitX, y0, y1);
    addBackWallPiece(backWallSplitX, b, y0, y1);
  } else if (b <= backWallSplitX) {
    addWorldUVBox(a, b, y0, y1, backStoneMaterial, 10, 5.75);
  } else {
    addWorldUVBox(a, b, y0, y1, backIceMaterial, 7, 5.75);
  }
}


function addBackWallBand(yFrom, yTo, openings) {
  let cursor = -backLength / 2;
  openings.forEach((o) => {
    addBackWallPiece(cursor, o.from, yFrom, yTo);
    cursor = o.to;
  });
  addBackWallPiece(cursor, backLength / 2, yFrom, yTo);
}


const rowHeight = 0.5;
const rowCount = Math.round(ROOM.height / rowHeight);
let bandStart = 0;
let bandKey = '';
let bandOpenings = [];

for (let r = 0; r < rowCount; r++) {
  const yMid = (r + 0.5) * rowHeight;

  const openings = WINDOW_OPENINGS
    .map((w) => {
      const half = openingHalfWidth(w, yMid);
      return { from: w.x - half, to: w.x + half, half };
    })
    .filter((o) => o.half > 0.3)
    .sort((p, q) => p.from - q.from);

  const key = openings.map((o) => o.from.toFixed(2) + ',' + o.to.toFixed(2)).join('|');

  if (r > 0 && key !== bandKey) {
    addBackWallBand(bandStart * rowHeight, r * rowHeight, bandOpenings);
    bandStart = r;
  }
  bandKey = key;
  bandOpenings = openings;
}
addBackWallBand(bandStart * rowHeight, rowCount * rowHeight, bandOpenings);


// ------------------------------------------------------------
// 10. SNOW PARTICLES
// ------------------------------------------------------------
const SNOW = {
  count: 800,       // number of snowflakes
  size: 0.35,       // size of each flake
  minSpeed: 2,    // slowest fall speed
  maxSpeed: 16,    // fastest fall speed
  drift: 1,       // how much flakes sway sideways
};

// Soft round dot used for each snowflake
const snowTexture = makeTexture(32, 32, (ctx) => {
  const glow = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  glow.addColorStop(0, '#ffffff');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 32, 32);
});
snowTexture.magFilter = T.LinearFilter;
snowTexture.minFilter = T.LinearFilter;


const snowPositions = new Float32Array(SNOW.count * 3);
const snowSpeeds = new Float32Array(SNOW.count);

for (let i = 0; i < SNOW.count; i++) {
  snowPositions[i * 3]     = (Math.random() - 0.5) * ROOM.width;    // x
  snowPositions[i * 3 + 1] = Math.random() * ROOM.height;           // y
  snowPositions[i * 3 + 2] = (Math.random() - 0.5) * ROOM.depth;    // z
  snowSpeeds[i] = SNOW.minSpeed + Math.random() * (SNOW.maxSpeed - SNOW.minSpeed);
}

const snowGeometry = new T.BufferGeometry();
snowGeometry.setAttribute('position', new T.BufferAttribute(snowPositions, 3));

const snowMaterial = new T.PointsMaterial({
  size: SNOW.size,
  map: snowTexture,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
});

scene.add(new T.Points(snowGeometry, snowMaterial));


function updateSnow(dt, time) {
  const positions = snowGeometry.attributes.position;

  for (let i = 0; i < SNOW.count; i++) {
    let y = positions.getY(i) - snowSpeeds[i] * dt;
    if (y < 0) y = ROOM.height;                       // restart at the top

    positions.setY(i, y);
    positions.setX(i, positions.getX(i) + Math.sin(time + i) * SNOW.drift * dt);
  }

  positions.needsUpdate = true;
}


// ------------------------------------------------------------
// 11. CONTROLS (drag = orbit, wheel = zoom, WASD/QE = move, arrows = rotate)
// ------------------------------------------------------------
const view = {
  angle: 0,
  tilt: 1.35,
  distance: 31,
  minTilt: 0.2,
  maxTilt: 1.55,
  minDistance: 8,
  maxDistance: 300,
};

const target = new T.Vector3(0, 4, -1);
const keys = {};

// Keyboard
addEventListener('keydown', (e) => (keys[e.code] = true));
addEventListener('keyup',   (e) => (keys[e.code] = false));

// Mouse / touch drag
let isDragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('pointerdown', (e) => {
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
  canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  view.angle -= (e.clientX - lastX) * 0.005;
  view.tilt = clamp(view.tilt - (e.clientY - lastY) * 0.005, view.minTilt, view.maxTilt);
  lastX = e.clientX;
  lastY = e.clientY;
});

canvas.addEventListener('pointerup', () => {
  isDragging = false;
  canvas.style.cursor = 'grab';
});

// Mouse wheel zoom
canvas.addEventListener('wheel', (e) => {
  view.distance = clamp(view.distance + e.deltaY * 0.02, view.minDistance, view.maxDistance);
  e.preventDefault();
}, { passive: false });

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Keyboard input
function updateControls(dt) {
  const forward = new T.Vector3(-Math.sin(view.angle), 0, -Math.cos(view.angle));
  const right   = new T.Vector3( Math.cos(view.angle), 0, -Math.sin(view.angle));
  const moveSpeed = 8 * dt;
  const turnSpeed = 1.5 * dt;

  // Move the target (WASD)
  if (keys.KeyW) target.addScaledVector(forward,  moveSpeed);
  if (keys.KeyS) target.addScaledVector(forward, -moveSpeed);
  if (keys.KeyD) target.addScaledVector(right,    moveSpeed);
  if (keys.KeyA) target.addScaledVector(right,   -moveSpeed);

  // Up / down (E / Q)
  if (keys.KeyE) target.y += moveSpeed;
  if (keys.KeyQ) target.y = Math.max(0.5, target.y - moveSpeed);

  // Rotate (arrow keys)
  if (keys.ArrowLeft)  view.angle += turnSpeed;
  if (keys.ArrowRight) view.angle -= turnSpeed;
  if (keys.ArrowUp)    view.tilt = Math.max(view.minTilt, view.tilt - dt);
  if (keys.ArrowDown)  view.tilt = Math.min(view.maxTilt, view.tilt + dt);

  target.x = clamp(target.x, -14, 14);
  target.z = clamp(target.z, -8.5, 9);
}

// Camera
function updateCamera() {
  camera.position.set(
    target.x + view.distance * Math.sin(view.tilt) * Math.sin(view.angle),
    target.y + view.distance * Math.cos(view.tilt),
    target.z + view.distance * Math.sin(view.tilt) * Math.cos(view.angle)
  );
  camera.lookAt(target);
}

// ------------------------------------------------------------
// 12. ANIMATION LOOP
// ------------------------------------------------------------
const clock = new T.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  const time = clock.elapsedTime;

  // Ice shimmer
  iceGlowRight.intensity = 1.2 + 0.3 * Math.sin(time * 1.5);
  iceGlowLeft.intensity  = 1.0 + 0.3 * Math.sin(time * 1.5 + 2);

  updateSnow(dt, time);
  updateControls(dt);
  updateCamera();

  renderer.render(scene, camera);
}

animate();