import * as THREE from 'three';
import { createMaterials } from './materials.js';

export function createGround(scene) {
  const { groundMaterial } = createMaterials();
  
  const groundSize = 100;
  const groundSegments = 100;
  const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, groundSegments, groundSegments);
  
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.0;
  ground.receiveShadow = true;
  scene.add(ground);
  
  return ground;
}

export function createGrass(scene, grassRadius) {
  const { grassMaterial, darkGrassMaterial } = createMaterials();
  
  // Create grass group
  const grassGroup = new THREE.Group();
  scene.add(grassGroup);
  
  // Create individual grass blades
  const grassBladeCount = 3000;
  
  // Create and distribute grass blades
  for (let i = 0; i < grassBladeCount; i++) {
    // Random angle and distance from center
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * grassRadius;
    
    // Calculate position
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    // Create and add the grass blade
    const blade = createGrassBlade(x, z, grassMaterial, darkGrassMaterial);
    grassGroup.add(blade);
  }
  
  return grassGroup;
}

function createGrassBlade(x, z, grassMaterial, darkGrassMaterial) {
  const height = 0.1 + Math.random() * 0.2; // Reduced height between 0.1 and 0.3
  const width = 0.03 + Math.random() * 0.03; // Reduced width between 0.03 and 0.06
  
  // Choose between light and dark grass materials
  const material = Math.random() > 0.5 ? grassMaterial : darkGrassMaterial;
  
  // Create a simple blade of grass using a box geometry
  const bladeGeometry = new THREE.BoxGeometry(width, height, width);
  const blade = new THREE.Mesh(bladeGeometry, material);
  
  // Position the grass blade
  blade.position.set(x, height / 2 - 0.9, z);
  
  // Slightly tilt the grass in a random direction
  blade.rotation.x = (Math.random() - 0.5) * 0.3;
  blade.rotation.z = (Math.random() - 0.5) * 0.3;
  
  blade.castShadow = true;
  blade.receiveShadow = true;
  
  return blade;
}