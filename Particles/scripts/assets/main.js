// Used imports instead

import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101020);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 0, 30);

// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

let stars;
let starGeometry;
let starMaterial;
let nameMesh;
let lastColorChange = 0;

lighting();
particles();
createName();

// Particle
function particles() {
    const particlePositions = [];

    for (let i = 0; i < 6000; i++) {
        const particle = new THREE.Vector3(
            Math.random() * 600 - 300,
            Math.random() * 600 - 300,
            Math.random() * 600 - 300
        );

        particlePositions.push(particle);
    }

    starGeometry = new THREE.BufferGeometry().setFromPoints(
        particlePositions
    );

    const starTexture = new THREE.TextureLoader().load(
        'scripts/assets/images/star.png'
    );

    starMaterial = new THREE.PointsMaterial({
        color: 0xffb6c1,
        size: 0.7,
        map: starTexture,
        transparent: true,
        depthWrite: false
    });

    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

// Particles fall indefinitely
function animateParticles() {
    const positions = starGeometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
        let y = positions.getY(i);

        y -= 0.9;

        // It resets the particle to the top
        if (y < -300) {
            y = 300;

            positions.setX(
                i,
                Math.random() * 600 - 300
            );

            positions.setZ(
                i,
                Math.random() * 600 - 300
            );
        }

        positions.setY(i, y);
    }

    positions.needsUpdate = true;
}

// 3D text with my name (That's how long my first name is)
function createName() {
    const woodTexture = new THREE.TextureLoader().load(
        'scripts/assets/textures/wooden.jpg'
    );

    const woodMaterial = new THREE.MeshBasicMaterial({
        map: woodTexture
    });

    const fontLoader = new FontLoader();

    fontLoader.load(
        'scripts/assets/fonts/helvetiker_regular.typeface.json',

        function (font) {
            const textGeometry = new TextGeometry('Mary Julia Gabrielle', {
              font: font,
              size: 5,
              depth: 1,
              curveSegments: 12,
              bevelEnabled: true,
              bevelThickness: 0.1,
              bevelSize: 0.05,
              bevelSegments: 3
          });

          textGeometry.center();

            nameMesh = new THREE.Mesh(
                textGeometry,
                woodMaterial
            );

            nameMesh.position.set(0, -2, -5);

            scene.add(nameMesh);
        },

        undefined,
        function (error) {
            console.error('Font loading failed:', error);
        }
    );
}

// Lights
function lighting() {
    const hemisphereLight = new THREE.HemisphereLight(
        0xffffff,
        0x444444,
        1
    );

    scene.add(hemisphereLight);

    const ambientLight = new THREE.AmbientLight(
        0xffffff,
        0.4
    );

    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(
        0xffffff,
        1.5
    );

    spotLight.position.set(0, 10, 20);
    spotLight.castShadow = true;

    scene.add(spotLight);
}

// Particle Colors
function updateParticleColor() {
    const currentTime = performance.now();

    if (currentTime - lastColorChange >= 3000) {
        starMaterial.color.setHSL(
            Math.random(),
            1,
            0.65
        );

        lastColorChange = currentTime;
    }
}

// Animation
function animate() {
    requestAnimationFrame(animate);

    animateParticles();
    updateParticleColor();

    // Rotates the name
    if (nameMesh) {
        nameMesh.rotation.y += 0.008;
    }

    renderer.render(scene, camera);
}


animate();


window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});
