const ROOM_WIDTH = 6;
const ROOM_DEPTH = 5;
const ROOM_HEIGHT = 3;
const WALL_THICKNESS = 0.2;
const HALF_W = ROOM_WIDTH / 2;
const HALF_D = ROOM_DEPTH / 2;

const COLORS = {
  wall: 0xFFE6F4,
  trim: 0xf3f0ea,
  white: 0xFEEBE7,
  lightWood: 0xFEEBE7,
  headboard: 0xFEEBE7,
  sheet: 0xf1eee8,
  duvet: 0xFFB8E0,
  pillow: 0xece6d8,
  throwBlanket: 0xFDE8F1,
  rugBorder: 0xEF6BA2,
  rugMiddle: 0xFDE8F1,
  curtain: 0xFF8ACC,
  borders: 0xFF8ACC,
  body: 0xFFB8E0,
  chair: 0xEB4288,
};

const BOOK_COLORS = [0x6A0B33, 0x17020B, 0xFDE8F1, 0xF280B0, 0xE7186E, 0xEB4288, 0x17020B, 0xF8BED6];

// Light settings for morning and night
const DAY = {
  sky: 0x9cc9ee,
  hemiSky: 0xdcecff,
  hemiGround: 0x8b7b68,
  hemiIntensity: 1.3,
  sunColor: 0xfff1d6,
  sunIntensity: 3.2,
};
const NIGHT = {
  sky: 0x0b1226,
  hemiSky: 0x3a4d80,
  hemiGround: 0x15121a,
  hemiIntensity: 0.35,
  sunColor: 0x7f9bff, 
  sunIntensity: 0.6,
};

// For le lamps (Switched on and off with day/night button)
const lamps = [];
let isNight = false;

let seed = 12;
function random() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

/* ============================================================
    RENDERER, SCENE, CAMERA*/
const scene = new THREE.Scene();
scene.background = new THREE.Color(DAY.sky);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 4.6, 8.8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);


const fullscreenButton = document.createElement('button');

fullscreenButton.textContent = 'Fullscreen';

fullscreenButton.style.cssText =
  'position:fixed; top:16px; right:16px; padding:8px 14px;' +
  'font:14px system-ui, sans-serif; border:0; border-radius:6px;' +
  'cursor:pointer; background:#f3f0ea; color:#2b2f36;';

document.body.appendChild(fullscreenButton);

fullscreenButton.addEventListener('click', function () {
  if (!document.fullscreenElement) {
    renderer.domElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

if ('useLegacyLights' in renderer) {
  renderer.useLegacyLights = false;
} else {
  renderer.physicallyCorrectLights = true;
}

const lookAtPoint = new THREE.Vector3(0, 1, -0.3);
let controls;

if (THREE.OrbitControls) {
  // OrbitControls.js was loaded in the HTML (Thanks to my classmate for helping me)
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.copy(lookAtPoint);
  controls.enableDamping = true;
  controls.minDistance = 3;
  controls.maxDistance = 16;
  controls.maxPolarAngle = Math.PI / 2 - 0.03;
  controls.update();
} else {
  controls = makeSimpleOrbit(camera, renderer.domElement, lookAtPoint);
}

/* ============================================================
    LIGHTS */


// Soft light from the sky
const hemi = new THREE.HemisphereLight(DAY.hemiSky, DAY.hemiGround, DAY.hemiIntensity);
scene.add(hemi);

// The sun shines through the windows
const sun = new THREE.DirectionalLight(DAY.sunColor, DAY.sunIntensity);
sun.position.set(-8, 7, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -6;
sun.shadow.camera.right = 6;
sun.shadow.camera.top = 6;
sun.shadow.camera.bottom = -6;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 25;
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
scene.add(sun);

/* ============================================================
   SMALL HELPER FUNCTIONS */

function makeBox(parent, width, height, depth, color, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeCylinder(parent, radiusTop, radiusBottom, height, color, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 24),
    new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeSphere(parent, radius, color, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 16, 12),
    new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}


function place(object, x, y, z) {
  object.position.set(x, y, z);
  return object;
}

function setSRGB(texture) {
  if ('colorSpace' in texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
}

function loadImageTexture(path) {
  const texture = new THREE.TextureLoader().load(path);
  setSRGB(texture);
  return texture;
}

// For the polkadots
function makePatternedBox(parent, width, height, depth, texture, metersWide, aspect, x, y, z) {
  const geometry = new THREE.BoxGeometry(width, height, depth);

  const faceSizes = [
    [depth, height], [depth, height],
    [width, depth], [width, depth],
    [width, height], [width, height],
  ];
  const uv = geometry.attributes.uv;
  for (let face = 0; face < 6; face++) {
    for (let corner = 0; corner < 4; corner++) {
      const i = face * 4 + corner;
      uv.setXY(i,
        uv.getX(i) * faceSizes[face][0] / metersWide,
        uv.getY(i) * faceSizes[face][1] / (metersWide * aspect));
    }
  }
  uv.needsUpdate = true;

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;

  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9 }));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

// Polka-dot duvet settings
const duvetTexture = loadImageTexture('images/duvet.jpg');
const DUVET_METERS_WIDE = 2.0;
const DUVET_ASPECT = 1774 / 998;

function makeDuvetPiece(parent, width, height, depth, x, y, z) {
  return makePatternedBox(parent, width, height, depth, duvetTexture, DUVET_METERS_WIDE, DUVET_ASPECT, x, y, z);
}

// Orbit controls
function makeSimpleOrbit(camera, domElement, target) {
  const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(target));
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  function apply() {
    camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(spherical));
    camera.lookAt(target);
  }

  domElement.style.touchAction = 'none';

  domElement.addEventListener('pointerdown', function (event) {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
  });
  window.addEventListener('pointerup', function () {
    dragging = false;
  });
  window.addEventListener('pointermove', function (event) {
    if (!dragging) return;
    spherical.theta -= (event.clientX - lastX) * 0.005;
    spherical.phi -= (event.clientY - lastY) * 0.005;
    spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.03, spherical.phi)); // stay above the floor
    lastX = event.clientX;
    lastY = event.clientY;
    apply();
  });
  domElement.addEventListener('wheel', function (event) {
    event.preventDefault();
    spherical.radius = Math.max(3, Math.min(16, spherical.radius * (1 + event.deltaY * 0.001)));
    apply();
  }, { passive: false });

  apply();
  return { update: function () {} };
}

/* ============================================================
   CANVAS TEXTURES */
function makeFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  const plankHeight = 40;

  const hue = 340;
  const saturation = 45;
  const baseLightness = 78;

  for (let row = 0; row < 25; row++) {
    let x = -random() * 500;
    while (x < 1200) {
      const length = 500 + random() * 300;
      const lightness = baseLightness + random() * 8;
      ctx.fillStyle = 'hsl(' + hue + ', ' + saturation + '%, ' + lightness + '%)';
      ctx.fillRect(x, row * plankHeight, length, plankHeight);
      ctx.strokeStyle = 'hsla(' + hue + ', ' + saturation + '%, ' + (baseLightness - 25) + '%, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, row * plankHeight, length, plankHeight);
      x += length;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  setSRGB(texture);
  texture.anisotropy = 8;
  return texture;
}


function makeArtTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 220;
  const ctx = canvas.getContext('2d');

  const sky = ctx.createLinearGradient(0, 0, 0, 220);
  sky.addColorStop(0, '#f2c48d');
  sky.addColorStop(1, '#f7e3c3');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 340, 220);

  ctx.fillStyle = '#e7784f'; // sun
  ctx.beginPath();
  ctx.arc(230, 100, 34, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#5b7f86'; // far hill
  ctx.beginPath();
  ctx.arc(90, 260, 150, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#34515a'; // near hill
  ctx.beginPath();
  ctx.arc(270, 300, 170, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  setSRGB(texture);
  return texture;
}

/* ============================================================
   WINDOWS AND WALLS */

function makeWindow(width, height) {
  const win = new THREE.Group();
  const bar = 0.06;
  const divider = 0.08;
  const depth = WALL_THICKNESS;

  // Outer frame
  makeBox(win, width, bar, depth, COLORS.trim, 0, height / 2 - bar / 2, 0);
  makeBox(win, width, bar, depth, COLORS.trim, 0, -height / 2 + bar / 2, 0);
  makeBox(win, bar, height, depth, COLORS.trim, -width / 2 + bar / 2, 0, 0);
  makeBox(win, bar, height, depth, COLORS.trim, width / 2 - bar / 2, 0, 0);

  // Two dividers for the three frames
  const paneSpace = width - 2 * bar - 2 * divider;
  const sidePane = paneSpace / 3;
  const dividerX = width / 2 - bar - sidePane - divider / 2;
  makeBox(win, divider, height - 2 * bar, depth, COLORS.trim, -dividerX, 0, 0);
  makeBox(win, divider, height - 2 * bar, depth, COLORS.trim, dividerX, 0, 0);
  makeBox(win, width + 0.2, 0.05, 0.22, COLORS.trim, 0, -height / 2, depth / 2 + 0.06);

  // Glass
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(width - bar, height - bar),
    new THREE.MeshPhysicalMaterial({
      color: 0xb3e5ff,
      transparent: true,
      opacity: 0.2,
      roughness: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  win.add(glass);

  // Curtains on both sides, hanging from a rod across the top
  const curtainZ = depth / 2 + 0.1;
  const curtainHeight = height + 0.2; // hangs 0.15 above and 0.3 below the window
  makeBox(win, 0.42, curtainHeight, 0.06, COLORS.curtain, -(width / 2 + 0.12), 0.05, curtainZ);
  makeBox(win, 0.42, curtainHeight, 0.06, COLORS.curtain, width / 2 + 0.12, 0.05, curtainZ);
  makeBox(win, width + 0.9, 0.03, 0.03, COLORS.charcoal, 0, height / 2 + 0.17, curtainZ);

  return win;
}


function makeWall(length, startExtra, endExtra, windowInfo) {
  const wall = new THREE.Group();
  const left = -startExtra;
  const right = length + endExtra;


  const shape = new THREE.Shape();
  shape.moveTo(left, 0);
  shape.lineTo(right, 0);
  shape.lineTo(right, ROOM_HEIGHT);
  shape.lineTo(left, ROOM_HEIGHT);

      if (windowInfo) {
    const x1 = windowInfo.center - windowInfo.width / 2;
    const x2 = windowInfo.center + windowInfo.width / 2;
    const y1 = windowInfo.bottom;
    const y2 = windowInfo.bottom + windowInfo.height;
    const hole = new THREE.Path();
    hole.moveTo(x1, y1);
    hole.lineTo(x2, y1);
    hole.lineTo(x2, y2);
    hole.lineTo(x1, y2);
    shape.holes.push(hole);
  }

  const geometry = new THREE.ExtrudeGeometry(shape, { depth: WALL_THICKNESS, bevelEnabled: false });
  geometry.translate(0, 0, -WALL_THICKNESS);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: COLORS.wall, roughness: 0.95 }));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  wall.add(mesh);

  // Baseboard along the bottom
  makeBox(wall, length, 0.12, 0.03, COLORS.trim, length / 2, 0.06, 0.015);

  if (windowInfo) {
    const win = makeWindow(windowInfo.width, windowInfo.height);
    win.position.set(windowInfo.center, windowInfo.bottom + windowInfo.height / 2, -WALL_THICKNESS / 2);
    wall.add(win);
  }

  return wall;
}

/* ============================================================
   LAMPS */
   
function makeShadeMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xf1e2c0,
    emissive: 0xffb45c,
    emissiveIntensity: 0,
    side: THREE.DoubleSide,
    roughness: 1,
  });
}

// Bedside lamp
function makeTableLamp() {
  const lamp = new THREE.Group();
  makeCylinder(lamp, 0.05, 0.08, 0.22, COLORS.body, 0, 0.11, 0);

  const shadeMaterial = makeShadeMaterial();
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 24, 1, true), shadeMaterial);
  shade.position.y = 0.33;
  shade.castShadow = true;
  lamp.add(shade);

  const light = new THREE.PointLight(0xffb463, 8, 8, 2);
  light.position.y = 0.32;
  lamp.add(light);

  lamps.push({ light: light, shadeMaterial: shadeMaterial, onIntensity: 1.0 });
  return lamp;
}

function makeDeskLamp() {
  const lamp = new THREE.Group();
  makeCylinder(lamp, 0.1, 0.1, 0.03, COLORS.borders, 0, 0.015, 0);

  const lowerArm = makeBox(lamp, 0.025, 0.4, 0.025, COLORS.borders, -0.068, 0.218, 0);
  lowerArm.rotation.z = 0.35;
  const upperArm = makeBox(lamp, 0.025, 0.35, 0.025, COLORS.borders, 0.026, 0.469, 0);
  upperArm.rotation.z = -1.2;

  const shadeMaterial = makeShadeMaterial();
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.11, 0.14, 24, 1, true), shadeMaterial);
  shade.position.set(0.19, 0.48, 0);
  lamp.add(shade);

  const light = new THREE.SpotLight(0xffb463, 0, 0, 1.0, 0.7, 2);
  light.position.set(0.19, 0.47, 0);
  light.target.position.set(0.19, 0, 0);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  lamp.add(light);
  lamp.add(light.target);

  lamps.push({ light: light, shadeMaterial: shadeMaterial, onIntensity: 8 });
  return lamp;
}

/* ========================================================================
   FURNITURE */

// Round fluffy rug.
function makeRoundRug(radius, texture, borderColor, x, z) {
  const border = new THREE.Mesh(
    new THREE.CylinderGeometry(radius + 0.1, radius + 0.1, 0.015, 64),
    new THREE.MeshStandardMaterial({ color: borderColor, roughness: 1 })
  );
  border.position.set(x, 0.0075, z);
  border.receiveShadow = true;
  scene.add(border);


  texture.repeat.set(1, 658 / 877);
  texture.offset.set(0, (1 - 658 / 877) / 2);


  const edge = new THREE.MeshStandardMaterial({ color: 0xe6e6ea, roughness: 1 });
  const top = new THREE.MeshStandardMaterial({ map: texture, roughness: 1 });
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.03, 64), [edge, top, edge]);
  rug.position.set(x, 0.015, z);
  rug.receiveShadow = true;
  scene.add(rug);
  return rug;
}

  function makeBed() {
  const bed = new THREE.Group();

  // Legs and frame
  for (const x of [-0.8, 0.8]) {
    for (const z of [-1.05, 1.05]) {
      makeBox(bed, 0.08, 0.15, 0.08, COLORS.white, x, 0.075, z);
    }
  }
  makeBox(bed, 1.7, 0.2, 2.2, COLORS.white, 0, 0.25, 0);

  // Headboard
  makeBox(bed, 1.8, 1.15, 0.1, COLORS.white, 0, 0.575, -1.05);
  makeBox(bed, 1.5, 0.5, 0.04, COLORS.headboard, 0, 0.85, -0.98);
  makeBox(bed, 1.8, 0.4, 0.08, COLORS.walnut, 0, 0.35, 1.06);

  // Mattress, duvet, folded sheet and throw blanket
  makeBox(bed, 1.6, 0.25, 2.0, COLORS.sheet, 0, 0.475, 0);
    makeDuvetPiece(bed, 1.66, 0.14, 1.4, 0, 0.67, 0.3);
  makeDuvetPiece(bed, 0.05, 0.3, 1.4, -0.83, 0.55, 0.3);
  makeDuvetPiece(bed, 0.05, 0.3, 1.4, 0.83, 0.55, 0.3); 
  makeBox(bed, 1.68, 0.16, 0.26, COLORS.sheet, 0, 0.68, -0.27);
  makeBox(bed, 1.7, 0.16, 0.4, COLORS.throwBlanket, 0, 0.68, 0.75);

  // Two pillows
  for (const x of [-0.4, 0.4]) {
    const pillow = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 24, 16),
      new THREE.MeshStandardMaterial({ color: COLORS.pillow, roughness: 0.9 })
    );
    pillow.scale.set(0.36, 0.3, 0.24);
    pillow.position.set(x, 0.7, -0.68);
    pillow.rotation.x = -0.12;
    pillow.castShadow = true;
    pillow.receiveShadow = true;
    bed.add(pillow);
  }

  return bed;
}

function makeEndTable() {
  const table = new THREE.Group();
  for (const x of [-0.21, 0.21]) {
    for (const z of [-0.21, 0.21]) {
      makeBox(table, 0.04, 0.51, 0.04, COLORS.walnut, x, 0.255, z);
    }
  }
  makeBox(table, 0.5, 0.04, 0.5, COLORS.lightWood, 0, 0.53, 0);
  makeBox(table, 0.42, 0.16, 0.42, COLORS.white, 0, 0.42, 0);    
  makeBox(table, 0.36, 0.1, 0.02, COLORS.lightWood, 0, 0.42, 0.215); 
  makeSphere(table, 0.02, COLORS.charcoal, 0, 0.42, 0.24);        
  return table;
}


function makeMonitor() {
  const monitor = new THREE.Group();
  makeCylinder(monitor, 0.12, 0.13, 0.02, COLORS.charcoal, 0, 0.01, 0);   // base
  makeBox(monitor, 0.05, 0.2, 0.03, COLORS.charcoal, 0, 0.11, -0.02);      // neck
  makeBox(monitor, 0.64, 0.38, 0.03, COLORS.charcoal, 0, 0.35, 0);         // frame

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.34),
    new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.2 })
  );
  screen.position.set(0, 0.35, 0.0155);
  monitor.add(screen);

  return monitor;

}

function makeDesk() {
  const desk = new THREE.Group();

  // Desk top, left side panel, back panel
  makeBox(desk, 1.9, 0.05, 0.7, COLORS.lightWood, 0.15, 0.725, 0);
  makeBox(desk, 0.05, 0.7, 0.66, COLORS.lightWood, -0.775, 0.35, 0);
  makeBox(desk, 1.0, 0.3, 0.02, COLORS.lightWood, -0.25, 0.55, -0.31);

  // Drawer unit
  makeBox(desk, 0.5, 0.7, 0.62, COLORS.walnut, 0.55, 0.35, 0);
  makeBox(desk, 0.44, 0.28, 0.02, COLORS.lightWood, 0.55, 0.19, 0.32);
  makeBox(desk, 0.44, 0.28, 0.02, COLORS.lightWood, 0.55, 0.51, 0.32);
  makeBox(desk, 0.3, 0.7, 0.62, COLORS.walnut, 0.95, 0.35, 0);
  makeSphere(desk, 0.015, COLORS.charcoal, 0.55, 0.19, 0.335);
  makeSphere(desk, 0.015, COLORS.charcoal, 0.55, 0.51, 0.335);

  // Things on the desk
  desk.add(place(makeMonitor(), 0, 0.75, -0.1));
  makeBox(desk, 0.42, 0.02, 0.14, 0xFA8FCD, 0, 0.76, 0.15);         // keyboard
  makeBox(desk, 0.06, 0.025, 0.1, 0xFCBBE1, 0.32, 0.7625, 0.15);    // mouse
  desk.add(place(makeDeskLamp(), -0.65, 0.75, -0.15));

  // Stack of books
  const stack = [
    { width: 0.28, height: 0.045, depth: 0.2, color: 0xE7186E },
    { width: 0.25, height: 0.035, depth: 0.19, color: 0xCEBFF8 },
    { width: 0.22, height: 0.03, depth: 0.16, color: 0xEAB0EB },
  ];
  let stackTop = 0.75;
  for (let i = 0; i < stack.length; i++) {
    const book = stack[i];
    const mesh = makeBox(desk, book.width, book.height, book.depth, book.color, 0.55, stackTop + book.height / 2, -0.05);
    mesh.rotation.y = (i - 1) * 0.15;
    stackTop += book.height;
  }

  // Coffee mug with a handle
  makeCylinder(desk, 0.04, 0.04, 0.09, 0xf2efe9, -0.3, 0.795, 0.22);
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.025, 0.007, 8, 16, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xf2efe9, roughness: 0.6 })
  );
  handle.position.set(-0.26, 0.795, 0.22);
  handle.rotation.z = -Math.PI / 2;
  handle.castShadow = true;
  desk.add(handle);

  return desk;
}

// The second half of the L shaped desk
function makeDeskWing(length) {
  const wing = new THREE.Group();
  makeBox(wing, length, 0.05, 0.7, COLORS.lightWood, 0, 0.725, 0);
  makeBox(wing, 0.05, 0.7, 0.66, COLORS.lightWood, length / 2 - 0.025, 0.35, 0); 
  return wing;
}
const wingLength = 1.2;
const deskWing = makeDeskWing(wingLength);
deskWing.position.set(2.65, 0, -1.78 + wingLength / 2); 
deskWing.rotation.y = -Math.PI / 2;                     
scene.add(deskWing);

// Desk chair
function makeChair() {
  const chair = new THREE.Group();
  makeBox(chair, 0.46, 0.07, 0.46, COLORS.chair, 0, 0.5, 0);      // seat
  makeBox(chair, 0.46, 0.5, 0.06, COLORS.chair, 0, 0.8, 0.22);    // backrest
  makeCylinder(chair, 0.03, 0.03, 0.4, COLORS.charcoal, 0, 0.26, 0);

  // Chair Base
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const arm = makeBox(chair, 0.3, 0.03, 0.04, COLORS.white, Math.cos(angle) * 0.15, 0.06, Math.sin(angle) * 0.15);
    arm.rotation.y = -angle;
    makeSphere(chair, 0.03, COLORS.white, Math.cos(angle) * 0.29, 0.03, Math.sin(angle) * 0.29);
  }
  return chair;
}

function makeBookcase() {
  const bookcase = new THREE.Group();
  const width = 1.2;
  const height = 1.8;
  const depth = 0.32;

  // SHELVES
  makeBox(bookcase, 0.03, height, depth, COLORS.walnut, -width / 2, height / 2, 0);
  makeBox(bookcase, 0.03, height, depth, COLORS.walnut, width / 2, height / 2, 0);
  makeBox(bookcase, width, height, 0.01, COLORS.lightWood, 0, height / 2, -depth / 2 + 0.005);
  for (const y of [0.015, 0.45, 0.9, 1.35, height - 0.015]) {
    makeBox(bookcase, width, 0.03, depth, COLORS.walnut, 0, y, 0);
  }

  // BOOKS
  const shelfTops = [0.03, 0.465, 0.915, 1.365];
  for (let row = 0; row < shelfTops.length; row++) {
    const fillUntil = row === 3 ? 0.1 : width / 2 - 0.08; 
    let x = -width / 2 + 0.05;
    while (x < fillUntil) {
      const bookWidth = 0.03 + random() * 0.03;
      const bookHeight = 0.22 + random() * 0.16;
      const color = BOOK_COLORS[Math.floor(random() * BOOK_COLORS.length)];
      makeBox(bookcase, bookWidth, bookHeight, 0.22, color, x + bookWidth / 2, shelfTops[row] + bookHeight / 2, 0.02);
      x += bookWidth + 0.004;
    }
  }

  
  makeCylinder(bookcase, 0.05, 0.07, 0.2, 0xd9d0bd, 0.38, 1.365 + 0.1, 0.02);

  return bookcase;
}

function makePicture(imagePath, width, height) {
  const picture = new THREE.Group();
  makeBox(picture, width + 0.2, height + 0.2, 0.03, COLORS.borders, 0, 0, 0); // frame
  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({ map: loadImageTexture(imagePath), roughness: 0.9 })
  );
  art.position.z = 0.0155;
  picture.add(art);
  return picture;
}

/* ============================================================================
  THE WHOLE ROOM */

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH),
  new THREE.MeshStandardMaterial({ map: makeFloorTexture(), roughness: 0.6 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Back wall
const backWall = makeWall(ROOM_WIDTH, WALL_THICKNESS, WALL_THICKNESS, { center: 3.9, bottom: 0, width: 2.9, height: 2.83 });
backWall.position.set(-HALF_W, 0, -HALF_D);
scene.add(backWall);

// Left wall
const leftWall = makeWall(ROOM_DEPTH, 0, 0, { center: 2.5, bottom: 0, width: 2.9, height: 2.83 });
leftWall.position.set(-HALF_W, 0, HALF_D);
leftWall.rotation.y = Math.PI / 2;
scene.add(leftWall);

// Right wall
const rightWall = makeWall(ROOM_DEPTH, 0, 0, null);
rightWall.position.set(HALF_W, 0, -HALF_D);
rightWall.rotation.y = -Math.PI / 2;
scene.add(rightWall);

// Rug
makeRoundRug(1.8, loadImageTexture('images/rug.jpg'), COLORS.rugBorder, -1, 0);

//Pictures
scene.add(place(makeBed(), -2.0, 0, -1.38));
scene.add(place(makePicture('images/Mita.jpg', 0.675, 0.9), -2.0, 2, -HALF_D + 0.015));

const picture2 = place(
  makePicture('images/family.jpg', 0.6, 1),
  HALF_W - 0.015, 2.0, 1.5
);
picture2.rotation.y = -Math.PI / 2;
scene.add(picture2);

const picture3 = place(
  makePicture('images/FLAMEEE.jpg', 0.6, 0.8),
  HALF_W - 0.015, 2.0, -1.5
);
picture3.rotation.y = -Math.PI / 2;
scene.add(picture3);


const rightTable = place(makeEndTable(), -0.8, 0, -2.23);
rightTable.add(place(makeTableLamp(), -0.05, 0.55, -0.02));
makeBox(rightTable, 0.2, 0.04, 0.15, 0x8e3b46, 0.13, 0.57, 0.06); // a book
scene.add(rightTable);

// Study area
scene.add(place(makeDesk(), 1.9, 0, -2.13));
const chair = place(makeChair(), 1.9, 0, -1.3);
chair.rotation.y = 0.35;
scene.add(chair);

// Bookcase on the right wall
const bookcase = place(makeBookcase(), HALF_W -0.16, 0, 0.025);
bookcase.rotation.y = -Math.PI / 2;
scene.add(bookcase);

//Sofa
const roundSofa = makeRoundSofa();
roundSofa.position.set(1.8, 0, 1.3);
roundSofa.rotation.y = 0.9;
scene.add(roundSofa);

//Plant
const plant = makePlant();
scene.add(place(plant, 0.80, 0, -1.90));

// MEAT CUBE
const texture = new THREE.TextureLoader().load('images/ENRICO.jpg');
const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2); 
const material = new THREE.MeshStandardMaterial({ map: texture });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.set(2.5, 0.85, -1.5);
scene.add(cube);


/* ==========================================================================
  DAY/NIGHT BUTTON */

const button = document.createElement('button');
button.style.cssText =
  'position:fixed; top:16px; left:16px; padding:8px 14px; font:14px system-ui, sans-serif;' +
  'border:0; border-radius:6px; cursor:pointer; background:#f3f0ea; color:#2b2f36;';
document.body.appendChild(button);

function applyTimeOfDay() {
  const t = isNight ? NIGHT : DAY;

  scene.background.set(t.sky);
  hemi.color.set(t.hemiSky);
  hemi.groundColor.set(t.hemiGround);
  hemi.intensity = t.hemiIntensity;
  sun.color.set(t.sunColor);
  sun.intensity = t.sunIntensity;

  // Lamps are only turned on at night
  for (const lamp of lamps) {
    lamp.light.intensity = isNight ? lamp.onIntensity : 0;
    if (lamp.shadeMaterial) {
      lamp.shadeMaterial.emissiveIntensity = isNight ? 1.2 : 0;
    }
  }

  button.textContent = isNight ? 'Switch to day' : 'Switch to night';
}

button.addEventListener('click', function () {
  isNight = !isNight;
  applyTimeOfDay();
});
applyTimeOfDay();

/* ============================================================================
  RESIZE AND ANIMATION */

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();



  leftWall.visible = camera.position.x > -HALF_W;
  rightWall.visible = camera.position.x < HALF_W;
  backWall.visible = camera.position.z > -HALF_D;

  renderer.render(scene, camera);
}
animate();
