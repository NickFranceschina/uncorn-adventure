import * as THREE from 'three';

export function setupBubbles(scene, playBubbleSound) {
  const bubbleGroup = new THREE.Group();
  scene.add(bubbleGroup);
  
  function createBubble() {
    const bubble = new THREE.Group();
    
    // Create transparent bubble sphere
    const bubbleGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const bubbleMaterial = new THREE.MeshPhysicalMaterial({
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      metalness: 0,
      iridescence: 0.3,
      clearcoat: 1.0,
      transmission: 0.95,
    });
    const bubbleSphere = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
    bubble.add(bubbleSphere);
    
    // Create star inside bubble
    const starGeometry = new THREE.OctahedronGeometry(0.15);
    const starMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
      emissive: new THREE.Color().setHSL(Math.random(), 0.8, 0.4),
      roughness: 0.2,
      metalness: 0.8,
    });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    bubble.add(star);
    
    // Add subtle point light
    const starLight = new THREE.PointLight(starMaterial.color, 0.8, 2);
    starLight.position.set(0, 0, 0);
    bubble.add(starLight);
    
    // Position bubble
    const spawnRadius = 8;
    const angle = Math.random() * Math.PI * 2;
    const distance = 3 + Math.random() * spawnRadius;
    bubble.position.x = Math.cos(angle) * distance;
    bubble.position.z = Math.sin(angle) * distance;
    bubble.position.y = 2.5 + Math.random() * 0.5; // Float between 2.5 and 3.0 units high
    
    bubble.userData = { isBubble: true, collected: false };
    
    return bubble;
  }
  
  function spawnBubbles(count) {
    for (let i = 0; i < count; i++) {
      const bubble = createBubble();
      bubbleGroup.add(bubble);
    }
  }
  
  function animateBubbleCollection(bubble) {
    const startScale = bubble.scale.x;
    const startTime = Date.now();
    const animationDuration = 800;
    
    function animateBubble() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Bubble pop effect
      bubble.scale.setScalar(startScale * (1 + progress * 0.5));
      bubble.children[0].material.opacity = 0.3 * (1 - progress);
      
      // Star sparkle effect
      bubble.children[1].rotation.y += 0.2;
      bubble.children[1].scale.setScalar(1 - progress);
      
      // Light fade
      bubble.children[2].intensity = 0.8 * (1 - progress);
      
      if (progress < 1) {
        requestAnimationFrame(animateBubble);
      } else {
        bubbleGroup.remove(bubble);
      }
    }
    
    animateBubble();
  }
  
  return { bubbleGroup, spawnBubbles, animateBubbleCollection };
} 