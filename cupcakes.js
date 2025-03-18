import * as THREE from 'three';
import { createMaterials } from './materials.js';

export function setupCupcakes(scene, playCupcakeSound) {
  const { frostingColors, paperColors } = createMaterials();
  
  // Create cupcake group
  const cupcakeGroup = new THREE.Group();
  scene.add(cupcakeGroup);
  
  // Function to create a cupcake
  function createCupcake() {
    const cupcake = new THREE.Group();
    
    // Random colors for this cupcake
    const frostingColor = frostingColors[Math.floor(Math.random() * frostingColors.length)];
    const paperColor = paperColors[Math.floor(Math.random() * paperColors.length)];
    
    // Create cupcake base (paper cup)
    const paperGeometry = new THREE.CylinderGeometry(0.3, 0.2, 0.4, 16);
    const paperMaterial = new THREE.MeshStandardMaterial({
      color: paperColor,
      roughness: 0.8,
      metalness: 0.1,
    });
    const paper = new THREE.Mesh(paperGeometry, paperMaterial);
    paper.position.y = -0.2;
    paper.castShadow = true;
    paper.receiveShadow = true;
    cupcake.add(paper);
    
    // Create frosting
    const frostingGeometry = new THREE.SphereGeometry(0.35, 32, 32);
    const frostingMaterial = new THREE.MeshStandardMaterial({
      color: frostingColor,
      roughness: 0.7,
      metalness: 0.2,
    });
    const frosting = new THREE.Mesh(frostingGeometry, frostingMaterial);
    frosting.position.y = 0.15;
    frosting.scale.set(1, 0.8, 1);
    frosting.castShadow = true;
    frosting.receiveShadow = true;
    cupcake.add(frosting);
    
    // Add sprinkles
    const sprinkleCount = 8 + Math.floor(Math.random() * 7);
    for (let i = 0; i < sprinkleCount; i++) {
      const sprinkleGeometry = new THREE.BoxGeometry(0.03, 0.1, 0.03);
      const sprinkleMaterial = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xFFFFFF, // Random sprinkle color
        roughness: 0.5,
        metalness: 0.2,
      });
      
      const sprinkle = new THREE.Mesh(sprinkleGeometry, sprinkleMaterial);
      
      // Position on top of frosting with random rotation
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 0.25;
      sprinkle.position.x = Math.cos(angle) * distance;
      sprinkle.position.z = Math.sin(angle) * distance;
      sprinkle.position.y = 0.35 + Math.random() * 0.1;
      
      // Random rotation
      sprinkle.rotation.x = Math.random() * Math.PI;
      sprinkle.rotation.y = Math.random() * Math.PI;
      sprinkle.rotation.z = Math.random() * Math.PI;
      
      frosting.add(sprinkle);
    }
    
    // Add a cherry on top (optional, random)
    if (Math.random() > 0.3) {
      const cherryGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const cherryMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF0000,
        roughness: 0.6,
        metalness: 0.3,
      });
      const cherry = new THREE.Mesh(cherryGeometry, cherryMaterial);
      cherry.position.y = 0.5;
      cherry.castShadow = true;
      cherry.receiveShadow = true;
      cupcake.add(cherry);
      
      // Add cherry stem
      const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8);
      const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.1,
      });
      const stem = new THREE.Mesh(stemGeometry, stemMaterial);
      stem.position.y = 0.6;
      stem.castShadow = true;
      stem.receiveShadow = true;
      cupcake.add(stem);
    }
    
    // Add the cupcake to the group
    cupcake.userData = { isCupcake: true, collected: false };
    
    // Scale the entire cupcake
    cupcake.scale.set(1.25, 1.25, 1.25);
    
    // Position the cupcake in a random location
    const spawnRadius = 8;
    const angle = Math.random() * Math.PI * 2;
    const distance = 3 + Math.random() * spawnRadius;
    cupcake.position.x = Math.cos(angle) * distance;
    cupcake.position.z = Math.sin(angle) * distance;
    cupcake.position.y = -0.7; // Just above ground
    
    // Add glow effect to make cupcakes more visible
    const cupcakeLight = new THREE.PointLight(frostingColor, 0.5, 1);
    cupcakeLight.position.y = 0.3;
    cupcake.add(cupcakeLight);
    
    return cupcake;
  }
  
  // Spawn cupcakes
  function spawnCupcakes(count) {
    for (let i = 0; i < count; i++) {
      const cupcake = createCupcake();
      cupcakeGroup.add(cupcake);
    }
  }
  
  // Animate cupcake collection
  function animateCupcakeCollection(cupcake) {
    // Floating animation
    const startY = cupcake.position.y;
    const startScale = cupcake.scale.x;
    const animationDuration = 1000; // ms
    const startTime = Date.now();
    
    function animateCupcake() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Float upward
      cupcake.position.y = startY + progress * 2;
      
      // Spin
      cupcake.rotation.y += 0.1;
      
      // Shrink and fade
      const newScale = startScale * (1 - progress);
      cupcake.scale.set(newScale, newScale, newScale);
      
      if (progress < 1) {
        requestAnimationFrame(animateCupcake);
      } else {
        // Remove from scene when animation complete
        cupcakeGroup.remove(cupcake);
      }
    }
    
    animateCupcake();
  }
  
  return { cupcakeGroup, spawnCupcakes, animateCupcakeCollection };
}