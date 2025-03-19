export function initControls(character, state, camera, cameraState, audio) {
  let isDragging = false;
  let previousMousePosition = {
    x: 0,
    y: 0
  };
  let lastTapTime = 0;
  const DOUBLE_TAP_DURATION = 300; // milliseconds between taps
  let initialPinchDistance = 0;
  
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
      state.characterRotationY -= deltaMove.x * 0.01;
      character.rotation.y = state.characterRotationY;
      
      // Update character direction vector based on rotation
      // Standard formula for direction vector from rotation angle
      state.characterDirection.x = Math.sin(state.characterRotationY);  
      state.characterDirection.z = Math.cos(state.characterRotationY);
      
      // Add vertical movement for speed control (like touch controls)
      const speedDelta = -deltaMove.y * 0.0005;
      state.movementSpeed = Math.max(0, Math.min(0.2, state.movementSpeed + speedDelta));
    }
    
    previousMousePosition = {
      x: e.clientX,
      y: e.clientY
    };
  });
  
  document.addEventListener('mouseup', (e) => {
    isDragging = false;
  });

  // Add this after the mouse controls and before the touch controls
  document.addEventListener('dblclick', (e) => {
    e.preventDefault();
    
    // Make Uncorn jump if not already jumping
    if (!state.isJumping) {
      state.isJumping = true;
      state.jumpHeight = 0;
      state.jumpPhase = "up";
      
      // Play jump sound
      audio.playJumpSound();
    }
  });

  // Touch controls for rotation, speed, and jumping
  document.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent default touch behavior
    
    if (e.touches.length === 1) {
      const currentTime = Date.now();
      if (currentTime - lastTapTime < DOUBLE_TAP_DURATION) {
        // Double tap detected - make Uncorn jump
        if (!state.isJumping) {
          state.isJumping = true;
          state.jumpHeight = 0;
          state.jumpPhase = "up";
          
          // Play jump sound
          audio.playJumpSound();
        }
      }
      lastTapTime = currentTime;
      
      // Start dragging for rotation and speed
      isDragging = true;
      previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    } else if (e.touches.length === 2) {
      // Start pinch zoom
      isDragging = false;
      initialPinchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      previousMousePosition = {
        x: 0,
        y: 0
      };
    }
  }, { passive: false });
  
  document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      // Handle pinch zoom
      const currentPinchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      if (initialPinchDistance === 0) {
        initialPinchDistance = currentPinchDistance;
        return;
      }
      
      // Calculate zoom direction and apply a larger scale factor
      const zoomDirection = currentPinchDistance > initialPinchDistance ? -1 : 1;
      const scaleFactor = 0.02;
      const delta = Math.abs(currentPinchDistance - initialPinchDistance) * scaleFactor;
      
      // Update the camera state
      const newDistance = Math.max(2, Math.min(12, cameraState.distance + (zoomDirection * delta)));
      console.log('Zoom:', {
        current: currentPinchDistance,
        initial: initialPinchDistance,
        direction: zoomDirection,
        delta: delta,
        oldDistance: cameraState.distance,
        newDistance: newDistance
      });
      
      cameraState.distance = newDistance;
      initialPinchDistance = currentPinchDistance;
    } else if (e.touches.length === 1 && isDragging) {
      // Handle rotation and speed
      const deltaMove = {
        x: e.touches[0].clientX - previousMousePosition.x,
        y: e.touches[0].clientY - previousMousePosition.y
      };
      
      // Horizontal movement for rotation
      state.characterRotationY -= deltaMove.x * 0.01;
      character.rotation.y = state.characterRotationY;
      
      // Update character direction vector based on rotation
      state.characterDirection.x = Math.sin(state.characterRotationY);  
      state.characterDirection.z = Math.cos(state.characterRotationY);
      
      // Vertical movement for speed control
      // Negative deltaMove.y so dragging up increases speed
      const speedDelta = -deltaMove.y * 0.0005;
      state.movementSpeed = Math.max(0, Math.min(0.2, state.movementSpeed + speedDelta));
      
      previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  }, { passive: false });
  
  document.addEventListener('touchend', (e) => {
    e.preventDefault();
    isDragging = false;
    initialPinchDistance = 0;
  }, { passive: false });
  
  // Add this after the touchend event listener and before the keyboard controls
  document.addEventListener('wheel', (e) => {
    // Check if this is a pinch gesture (ctrl + wheel)
    if (e.ctrlKey) {
      e.preventDefault();
      
      // Convert the wheel delta to a zoom factor
      // Negative delta means pinch-in (zoom out), positive means pinch-out (zoom in)
      const zoomDirection = e.deltaY > 0 ? 1 : -1;
      const scaleFactor = 0.1;
      
      // Update the camera state
      const newDistance = Math.max(2, Math.min(12, cameraState.distance + (zoomDirection * scaleFactor)));
      cameraState.distance = newDistance;
    }
  }, { passive: false });
  
  // Keyboard controls for speed, jumping, and rotation
  window.addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'ArrowUp':
        e.preventDefault();
        state.movementSpeed = Math.min(state.movementSpeed + 0.01, 0.2);
        break;
      case 'ArrowDown':
        e.preventDefault();
        state.movementSpeed = Math.max(state.movementSpeed - 0.01, 0);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        state.characterRotationY += 0.3;
        character.rotation.y = state.characterRotationY;
        state.characterDirection.x = Math.sin(state.characterRotationY);
        state.characterDirection.z = Math.cos(state.characterRotationY);
        break;
      case 'ArrowRight':
        e.preventDefault();
        state.characterRotationY -= 0.3;
        character.rotation.y = state.characterRotationY;
        state.characterDirection.x = Math.sin(state.characterRotationY);
        state.characterDirection.z = Math.cos(state.characterRotationY);
        break;
      case ' ':
        e.preventDefault();
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