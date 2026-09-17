// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Box
const boxGeometry = new THREE.BoxGeometry(9, 9, 5, 15);
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xFABBF1 });
const cube = new THREE.Mesh(boxGeometry, boxMaterial);
cube.position.x = 0;
cube.position.y = 1.5;
scene.add(cube);

// Cone
const coneGeometry = new THREE.ConeGeometry( 7, 19.5, 25 );
const coneMaterial = new THREE.MeshBasicMaterial( { color: 0xF467DF } );
const cone = new THREE.Mesh(coneGeometry, coneMaterial );
cone.position.x = 0;
cone.position.y = -5;
scene.add( cone );

// Cylinder
const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 25, 32);
const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0x8773E7 });
const cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
cylinder.position.x = 0;
cylinder.position.y = 2;
scene.add(cylinder);

// Sphere
const sphereGeometry = new THREE.SphereGeometry( 2, 5, 10 );
const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xDA25DA } );
const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
sphere.position.x = 0;
sphere.position.y = 10;
scene.add( sphere );


// Torus
const torusGeometry = new THREE.TorusGeometry( 4, 0.8, 18, 100);
const torusMaterial = new THREE.MeshBasicMaterial( { color: 0xBEBBFC } );
const torus = new THREE.Mesh( torusGeometry, torusMaterial );
torus.position.x = 0;
torus.position.y = 10;
scene.add( torus );


// Animating a scene
function animate() {

    requestAnimationFrame(animate);

    
    cylinder.rotation.z = Math.PI / 2;

    cone.rotation.y += 0.01;
    cone.rotation.z = Math.sin(Date.now() * 0.005) * 0.05;

    cube.rotation.x = Math.PI / 2;

    sphere.rotation.y += 0.03;

    torus.rotation.x += 0.02;

    renderer.render(scene, camera);
}
animate();
