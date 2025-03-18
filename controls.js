export function initControls(character, state, camera, audio) {
  let isDragging = false;
  let previousMousePosition = {
    x: 0,
    y: 0
  };
  
  // Mouse controls for rotation
  document.addEventListener('mousedown', (e) => {
    isDragging = true;
  });
  
  document.addEventListener('mousemove', (e) => {
    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };
    
    if (isDragging) {
      // Only rotate around Y axis for movement direction
      state.characterRotationY += deltaMove.x * 0.01;
      character.rotation.y = state.characterRotationY;
      
      // Update character direction vector based on rotation
      // Standard formula for direction vector from rotation angle
      state.characterDirection.x = Math.sin(state.characterRotationY);  
      state.characterDirection.z = Math.cos(state.characterRotationY);
    }
    
    previousMousePosition = {
      x: e.clientX,
      y: e.clientY
    };
  });
  
  document.addEventListener('mouseup', (e) => {
    isDragging = false;
  });
  
  // Keyboard controls for speed and jumping
  document.addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'ArrowUp':
        state.movementSpeed = Math.min(state.movementSpeed + 0.01, 0.2);
        break;
      case 'ArrowDown':
        state.movementSpeed = Math.max(state.movementSpeed - 0.01, 0);
        break;
      case ' ': // Space bar
        if (!state.isJumping) {
          state.isJumping = true;
          state.jumpHeight = 0;
          state.jumpPhase = "up";
          
          // Play jump sound
          audio.playJumpSound();
        }
        break;
    }
  });
  
  // Zoom with mouse wheel
  document.addEventListener('wheel', (e) => {
    camera.position.z = Math.max(3, Math.min(10, camera.position.z + e.deltaY * 0.01));
  });
}