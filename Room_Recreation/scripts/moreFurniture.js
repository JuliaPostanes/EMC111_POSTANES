//MORE FURNITURES HERE


// Round Sofa
function makeRoundSofa() {
  const sofa = new THREE.Group();

  // Base
  const cushion = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 0.3, 64),
    new THREE.MeshStandardMaterial({ color: 0xFFB8E0, roughness: 0.8 })
  );
  cushion.position.y = 0.175; // half the height
  cushion.castShadow = true;
  cushion.receiveShadow = true;
  sofa.add(cushion);


  const backrest = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.2, 24, 64, Math.PI), // half-circle arc
    new THREE.MeshStandardMaterial({ color: 0xFFB8E0, roughness: 0.8 })
  );
  backrest.rotation.x = Math.PI / 2; 
  backrest.position.y = 0.5;
  sofa.add(backrest);


  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 0.08, 64),
    new THREE.MeshStandardMaterial({ color: 0xFF8ACC, roughness: 0.9 })
  );
  base.position.y = 0.04;
  sofa.add(base);

  // Pillows (squashed spheres)
  for (const x of [-0.35, 0.35]) {
    const pillow = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0xFDE8F1, roughness: 0.9 })
    );
    pillow.scale.set(1.2, 0.6, 0.8);   // squashed shape
    pillow.position.set(x, 0.45, 0.50); // place near backrest
    pillow.rotation.x = 0;
    pillow.castShadow = true;
    pillow.receiveShadow = true;
    sofa.add(pillow);
  }

  return sofa;
}

function makePlant() {
  const plant = new THREE.Group();

  // Pot
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.10, 0.18, 32),
    new THREE.MeshStandardMaterial({ color: 0x85092C, roughness: 0.9 })
  );
  pot.position.y = 0.125;
  pot.castShadow = true;
  pot.receiveShadow = true;
  plant.add(pot);

  // Stem
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.5, 16),
    new THREE.MeshStandardMaterial({ color: 0xB4CA91, roughness: 0.8 })
  );
  stem.position.y = 0.5;
  stem.castShadow = true;
  plant.add(stem);

  // Leaves
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xB4CA91, roughness: 0.8 })
    );
    leaf.position.set(Math.cos(angle) * 0.25, 0.75, Math.sin(angle) * 0.25);
    leaf.castShadow = true;
    plant.add(leaf);
  }

  return plant;
}



