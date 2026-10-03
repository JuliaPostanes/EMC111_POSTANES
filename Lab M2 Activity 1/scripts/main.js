const scene = new THREE.Scene();

scene.background = new THREE.Color(0x222222);

const camera = new THREE.OrthographicCamera(
    -400, 400,
    400, -400,
    0.1, 1000
);

camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(800, 800);
document.body.appendChild(renderer.domElement);

// DVD Object
const geometry = new THREE.PlaneGeometry(120, 60);
const material = new THREE.MeshBasicMaterial({
    color: 0xff00d4,
    side: THREE.DoubleSide
});
const dvdLogo = new THREE.Mesh(geometry, material);

// Origin
dvdLogo.position.set(0, 0, 0);
scene.add(dvdLogo);

// Movement
let speedX = 3;
let speedY = 3;
let bounceCount = 0;

// Changes colors after every bounce
function changeColor() {
    material.color.setHex(Math.random() * 0xffffff);
}

function handleBounce() {
    // Changes the color of the DVD
    changeColor();

    // Makes the DVD smaller
    dvdLogo.scale.multiplyScalar(0.75);

    //Counts the bounces
    bounceCount++;

    // After 5-8 bounces, it will no longer be visible in the screen as stated in the
    // requirements :)
    if (bounceCount >= 7) {
        dvdLogo.visible = false;
    }
}

// Animation
function animate() {
    requestAnimationFrame(animate);

    dvdLogo.position.x += speedX;
    dvdLogo.position.y += speedY;

    // Left and right boundaries
    if (
        dvdLogo.position.x >= 340 ||
        dvdLogo.position.x <= -340
    ) {
        speedX *= -1;
        handleBounce();
    }

    // Top and bottom boundaries
    if (
        dvdLogo.position.y >= 370 ||
        dvdLogo.position.y <= -370
    ) {
        speedY *= -1;
        handleBounce();
    }

    renderer.render(scene, camera);
}
animate();