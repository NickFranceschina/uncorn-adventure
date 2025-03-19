import * as THREE from 'three';
import { setupScene } from './scene.js';
import { createCharacter } from './character.js';
import { createGround, createGrass } from './environment.js';
import { setupCupcakes } from './cupcakes.js';
import { initControls } from './controls.js';
import { setupAudio } from './audio.js';

// Game state
const state = {
  score: 0,
  movementSpeed: 0.05,
  characterDirection: new THREE.Vector3(0, 0, 1),
  characterRotationY: 0,
  isJumping: false,
  jumpHeight: 0,
  jumpPhase: "up",
  maxJumpHeight: 1.5,
  jumpSpeed: 0.08,
  walkingTime: 0,
  walkingSpeed: 3,
  walkingAmplitude: 0.3,
  collectionCooldown: false,
  lastSpawnTime: Date.now(),
  spawnInterval: 10000, // Spawn new cupcakes every 10 seconds
  grassRadius: 10
};

// Get DOM elements
const scoreDisplay = document.getElementById('scoreDisplay');

// Setup scene, camera and renderer
const { scene, camera, renderer } = setupScene();

// Setup audio context and sound functions
const audio = setupAudio();

// Create character
const { character, body, legs, hornGroup, leftEye, rightEye, characterBB } = createCharacter(scene);

// Create environment
const ground = createGround(scene);
const grassGroup = createGrass(scene, state.grassRadius);

// Setup cupcakes
const { cupcakeGroup, spawnCupcakes, animateCupcakeCollection } = setupCupcakes(scene, audio.playCupcakeSound);

// Spawn initial cupcakes
spawnCupcakes(10);

// Setup controls with camera state
const cameraState = {
  distance: isMobile || isTablet ? 8 : 5,  // Increased initial distance for mobile/tablet
  height: 2,
  tiltAngle: Math.PI/12
};

initControls(character, state, camera, cameraState, audio);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Update walking animation and time
  state.walkingTime += 0.02 * (state.movementSpeed * 15);
  
  // Animate the legs with a walking pattern (only if not jumping)
  if (!state.isJumping) {
    legs[0].rotation.x = Math.sin(state.walkingTime * state.walkingSpeed) * state.walkingAmplitude;
    legs[1].rotation.x = Math.sin(state.walkingTime * state.walkingSpeed + Math.PI) * state.walkingAmplitude;
    legs[2].rotation.x = Math.sin(state.walkingTime * state.walkingSpeed + Math.PI) * state.walkingAmplitude;
    legs[3].rotation.x = Math.sin(state.walkingTime * state.walkingSpeed) * state.walkingAmplitude;
    
    // Add a slight side-to-side rotation to legs
    legs.forEach((leg, i) => {
      // Add subtle rotation on y and z axes for more natural movement
      leg.rotation.z = Math.sin(state.walkingTime * state.walkingSpeed + (i * Math.PI/2)) * 0.05;
    });
    
    // Subtle body bounce with soft, rubber-like movement (only if not jumping)
    const bounceHeight = Math.abs(Math.sin(state.walkingTime * state.walkingSpeed)) * 0.05;
    body.position.y = bounceHeight;
    
    // Slight squash and stretch effect for soft rubber feel
    const squashFactor = 1 + Math.sin(state.walkingTime * state.walkingSpeed * 2) * 0.02;
    body.scale.y = squashFactor;
    body.scale.x = 1 + (1 - squashFactor) * 0.5;
    body.scale.z = 1 + (1 - squashFactor) * 0.5;
  }
  
  // Handle jumping
  if (state.isJumping) {
    if (state.jumpPhase === "up") {
      // Going up
      state.jumpHeight += state.jumpSpeed;
      character.position.y = 0.3 + state.jumpHeight;
      
      // Stretch the character slightly when going up
      body.scale.y = 1.1;
      body.scale.x = 0.95;
      body.scale.z = 0.95;
      
      // Spread legs slightly during jump
      legs.forEach(leg => {
        leg.rotation.x = 0.2;
      });
      
      // Switch to down phase when reaching max height
      if (state.jumpHeight >= state.maxJumpHeight) {
        state.jumpPhase = "down";
      }
    } else if (state.jumpPhase === "down") {
      // Coming down
      state.jumpHeight -= state.jumpSpeed;
      character.position.y = 0.3 + state.jumpHeight;
      
      // Prepare for landing by extending legs
      if (state.jumpHeight < state.maxJumpHeight / 2) {
        legs.forEach(leg => {
          leg.rotation.x = -0.2;
        });
      }
      
      // Landing
      if (state.jumpHeight <= 0) {
        state.jumpHeight = 0;
        character.position.y = 0.3;
        state.isJumping = false;
        
        // Play landing sound
        audio.playLandSound();
        
        // Squash effect on landing
        body.scale.y = 0.8;
        body.scale.x = 1.1;
        body.scale.z = 1.1;
        
        // Reset to normal after landing
        setTimeout(() => {
          body.scale.set(1, 1, 1);
        }, 150);
      }
    }
  }
  
  // Subtle horn movement for soft, jelly-like effect
  hornGroup.rotation.z = Math.sin(state.walkingTime) * 0.03;
  
  // Eye blinking occasionally
  if (Math.random() < 0.005) {
    leftEye.scale.set(1, 0.1, 1);
    rightEye.scale.set(1, 0.1, 1);
    setTimeout(() => {
      leftEye.scale.set(1, 1, 1);
      rightEye.scale.set(1, 1, 1);
    }, 150);
  }
  
  // Update character bounding box for collision detection
  characterBB.setFromObject(character);
  
  // Check for cupcake collection
  if (!state.collectionCooldown) {
    for (let i = 0; i < cupcakeGroup.children.length; i++) {
      const cupcake = cupcakeGroup.children[i];
      
      // Skip already collected cupcakes
      if (cupcake.userData.collected) continue;
      
      // Create a bounding box for the cupcake
      const cupcakeBB = new THREE.Box3().setFromObject(cupcake);
      
      // Check for collision
      if (characterBB.intersectsBox(cupcakeBB)) {
        // Mark as collected
        cupcake.userData.collected = true;
        
        // Play collection sound
        audio.playCupcakeSound();
        
        // Increment score
        state.score++;
        scoreDisplay.textContent = `Cupcakes: ${state.score}`;
        
        // Animate cupcake collection
        animateCupcakeCollection(cupcake);
        
        // Set cooldown to prevent multiple collections at once
        state.collectionCooldown = true;
        setTimeout(() => {
          state.collectionCooldown = false;
        }, 500);
        
        break; // Only collect one cupcake at a time
      }
    }
  }
  
  // Spawn new cupcakes periodically
  const currentTime = Date.now();
  if (currentTime - state.lastSpawnTime > state.spawnInterval) {
    spawnCupcakes(1 + Math.floor(Math.random() * 2)); // Spawn 1-2 new cupcakes
    state.lastSpawnTime = currentTime;
  }
  
  // Set the grass movement direction to be opposite of character direction
  grassGroup.position.x -= state.characterDirection.x * state.movementSpeed;
  grassGroup.position.z -= state.characterDirection.z * state.movementSpeed;
  
  // Set the cupcake movement direction to be opposite of character direction
  // This creates the illusion of character movement
  cupcakeGroup.position.x -= state.characterDirection.x * state.movementSpeed;
  cupcakeGroup.position.z -= state.characterDirection.z * state.movementSpeed;
  
  // Create wrapping effect by shifting individual grass blades
  // when they get too far from the character
  for (let i = 0; i < grassGroup.children.length; i++) {
    const blade = grassGroup.children[i];
    const worldPos = new THREE.Vector3();
    blade.getWorldPosition(worldPos);
    
    // Calculate distance from character
    const distX = worldPos.x - character.position.x;
    const distZ = worldPos.z - character.position.z;
    const dist = Math.sqrt(distX * distX + distZ * distZ);
    
    // If a blade is too far away, move it to the other side in the direction of movement
    if (dist > state.grassRadius) {
      // Calculate position on the opposite side in the direction of movement
      blade.position.x -= distX * 2;
      blade.position.z -= distZ * 2;
      
      // Add some randomness to prevent patterns
      blade.position.x += (Math.random() - 0.5) * 2;
      blade.position.z += (Math.random() - 0.5) * 2;
      
      // Randomize height and rotation for variety
      const height = 0.2 + Math.random() * 0.4;
      blade.scale.y = height * 5;
      blade.rotation.x = (Math.random() - 0.5) * 0.3;
      blade.rotation.z = (Math.random() - 0.5) * 0.3;
    }
  }
  
  // Animate cupcakes to make them more enticing
  cupcakeGroup.children.forEach((cupcake, index) => {
    if (!cupcake.userData.collected) {
      // Gentle bobbing motion
      cupcake.position.y = -0.7 + Math.sin(state.walkingTime * 0.5 + index * 0.5) * 0.1;
      
      // Subtle rotation
      cupcake.rotation.y += 0.01;
    }
  });
  
  // Update camera position based on tilt angle
  camera.position.set(
    character.position.x,
    character.position.y + cameraState.distance * Math.sin(cameraState.tiltAngle),
    character.position.z + cameraState.distance * Math.cos(cameraState.tiltAngle)
  );
  camera.lookAt(character.position);
  
  renderer.render(scene, camera);
}

// Start the animation
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});