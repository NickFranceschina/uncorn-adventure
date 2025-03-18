import * as THREE from 'three';

export function createMaterials() {
  // Character materials
  const pinkMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffb6c1, 
    roughness: 0.7,
    metalness: 0.0,
    flatShading: false
  });
  
  const blackMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x222222, 
    roughness: 0.8,
    metalness: 0.0,
    flatShading: false
  });
  
  const whiteMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.7,
    metalness: 0.0,
    flatShading: false
  });
  
  const yellowMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffff00, 
    roughness: 0.4,
    metalness: 0.2,
    emissive: 0xffff00,
    emissiveIntensity: 0.8,
    flatShading: false
  });
  
  // Environment materials
  const grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x7CFC00,
    roughness: 0.8,
    metalness: 0.1,
    flatShading: true
  });
  
  const darkGrassMaterial = new THREE.MeshStandardMaterial({
    color: 0x568203,
    roughness: 0.8,
    metalness: 0.1,
    flatShading: true
  });
  
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x7EC850,
    roughness: 0.9,
    metalness: 0.0
  });
  
  // Cupcake colors
  const frostingColors = [
    0xFF69B4, // Hot Pink
    0x32CD32, // Lime Green
    0x1E90FF, // Dodger Blue
    0xFFD700, // Gold
    0x9932CC, // Dark Orchid
    0xFF4500, // Orange Red
    0x00CED1, // Dark Turquoise
    0xFF00FF, // Magenta
  ];
  
  const paperColors = [
    0xFFFFE0, // Light Yellow
    0xF0FFF0, // Honeydew
    0xF5F5DC, // Beige
    0xFFEFD5, // Papaya Whip
    0xFFF0F5, // Lavender Blush
  ];
  
  return {
    pinkMaterial,
    blackMaterial,
    whiteMaterial,
    yellowMaterial,
    grassMaterial,
    darkGrassMaterial,
    groundMaterial,
    frostingColors,
    paperColors
  };
}