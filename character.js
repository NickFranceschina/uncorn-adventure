import * as THREE from 'three';
import { createMaterials } from './materials.js';

export function createCharacter(scene) {
  const { pinkMaterial, blackMaterial, whiteMaterial, yellowMaterial } = createMaterials();
  
  // Character group
  const character = new THREE.Group();
  character.position.y = 0.3;
  scene.add(character);
  
  // Body (main sphere)
  const bodyGeometry = new THREE.SphereGeometry(1, 32, 32);
  const body = new THREE.Mesh(bodyGeometry, pinkMaterial);
  body.castShadow = true;
  body.receiveShadow = true;
  character.add(body);
  
  // Create horn
  const hornGroup = createHorn(blackMaterial);
  character.add(hornGroup);
  
  // Create eyes
  const { leftEye, rightEye } = createEyes(whiteMaterial, blackMaterial);
  character.add(leftEye, rightEye);
  
  // Create glowing disk on forehead
  const foreheadDiskGroup = createForeheadDisk(yellowMaterial);
  character.add(foreheadDiskGroup);
  
  // Create smile
  const smile = createSmile(blackMaterial);
  character.add(smile);
  
  // Create legs
  const legs = createLegs(pinkMaterial);
  legs.forEach(leg => character.add(leg));
  
  // Create bounding box for collision detection
  const characterBB = new THREE.Box3().setFromObject(character);
  
  return { 
    character, 
    body, 
    hornGroup, 
    leftEye, 
    rightEye,
    legs,
    characterBB
  };
}

function createHorn(blackMaterial) {
  const hornGroup = new THREE.Group();
  hornGroup.position.set(0, 0.6, 0.4); // Positioned forward near eyes
  
  const hornHeight = 0.8;
  const hornRadius = 0.2;
  const hornWindings = 1.75;
  const hornSegments = 60;
  const hornPoints = [];
  
  // Create points for the horn curve with soft-serve shape
  for (let i = 0; i <= hornSegments; i++) {
    const t = i / hornSegments;
    const angle = hornWindings * Math.PI * 2 * t;
    
    // Create a taper toward the top
    const taperedRadius = hornRadius * (1 - 0.6 * Math.pow(t, 1.1));
    
    const x = taperedRadius * Math.cos(angle);
    const z = taperedRadius * Math.sin(angle);
    
    // More pronounced height
    const y = Math.pow(t, 0.8) * hornHeight;
    
    hornPoints.push(new THREE.Vector3(x, y, z));
  }
  
  // Create curve and geometry
  const hornCurve = new THREE.CatmullRomCurve3(hornPoints);
  const hornTubeGeometry = new THREE.TubeGeometry(
    hornCurve,
    hornSegments,
    hornRadius * 0.5,
    20,
    false
  );
  
  const horn = new THREE.Mesh(hornTubeGeometry, blackMaterial);
  horn.castShadow = true;
  hornGroup.add(horn);
  
  return hornGroup;
}

function createEyes(whiteMaterial, blackMaterial) {
  const createEye = (x) => {
    const eyeGroup = new THREE.Group();
    
    // White part
    const eyeWhiteGeometry = new THREE.SphereGeometry(0.25, 32, 16);
    const eyeWhite = new THREE.Mesh(eyeWhiteGeometry, whiteMaterial);
    eyeWhite.castShadow = true;
    eyeGroup.add(eyeWhite);
    
    // Pupil
    const pupilGeometry = new THREE.SphereGeometry(0.15, 32, 16);
    const pupil = new THREE.Mesh(pupilGeometry, blackMaterial);
    pupil.position.z = 0.15;
    pupil.castShadow = true;
    eyeGroup.add(pupil);
    
    eyeGroup.position.set(x, 0.2, 0.85);
    return eyeGroup;
  };
  
  const leftEye = createEye(-0.4);
  const rightEye = createEye(0.4);
  
  return { leftEye, rightEye };
}

function createForeheadDisk(yellowMaterial) {
  const foreheadDiskGroup = new THREE.Group();
  foreheadDiskGroup.position.set(0, 0.5, 0);
  
  // Create a glowing yellow disk
  const glowingDiskGeometry = new THREE.CylinderGeometry(0.13, 0.13, 0.02, 32);
  const glowingDisk = new THREE.Mesh(glowingDiskGeometry, yellowMaterial);
  glowingDisk.rotation.x = Math.PI / 2;
  glowingDisk.position.z = 0.95;
  foreheadDiskGroup.add(glowingDisk);
  
  // Add a point light inside the disk to create glow
  const diskLight = new THREE.PointLight(0xffff00, 0.5, 0.5);
  diskLight.position.z = 0.9;
  foreheadDiskGroup.add(diskLight);
  
  return foreheadDiskGroup;
}

function createSmile(blackMaterial) {
  const smileCurvePoints = [];
  const smileWidth = 0.25;
  const smileHeight = 0.06;
  const segments = 20;
  
  // Generate points for a simple curved smile
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = Math.PI * t;
    const x = -smileWidth * Math.cos(angle);
    const y = -smileHeight * Math.sin(angle) - 0.1;
    smileCurvePoints.push(new THREE.Vector3(x, y, 0.97));
  }
  
  // Create the geometry from these points
  const smileCurve = new THREE.CatmullRomCurve3(smileCurvePoints);
  const smileGeometry = new THREE.TubeGeometry(smileCurve, 20, 0.025, 8, false);
  const smile = new THREE.Mesh(smileGeometry, blackMaterial);
  
  return smile;
}

function createLegs(pinkMaterial) {
  const legs = [];
  
  const createLeg = (x, z) => {
    const legGroup = new THREE.Group();
    
    // Upper leg - short cylinder
    const upperLegGeometry = new THREE.CylinderGeometry(0.13, 0.15, 0.2, 16);
    const upperLeg = new THREE.Mesh(upperLegGeometry, pinkMaterial);
    upperLeg.position.y = -0.15;
    upperLeg.castShadow = true;
    legGroup.add(upperLeg);
    
    // Foot - sphere slightly squashed
    const footGeometry = new THREE.SphereGeometry(0.18, 16, 16);
    const foot = new THREE.Mesh(footGeometry, pinkMaterial);
    foot.position.y = -0.3;
    foot.scale.set(1, 0.7, 1);
    foot.castShadow = true;
    legGroup.add(foot);
    
    legGroup.position.set(x, -0.7, z);
    legs.push(legGroup);
    
    return legGroup;
  };
  
  // Create four legs
  createLeg(-0.4, 0.4);  // Front left
  createLeg(0.4, 0.4);   // Front right
  createLeg(-0.4, -0.4); // Back left
  createLeg(0.4, -0.4);  // Back right
  
  return legs;
}