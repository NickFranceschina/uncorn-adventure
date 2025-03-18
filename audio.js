export function setupAudio() {
  // Create audio context for more reliable sound
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Function to play a sound
  function playSound(frequency, duration, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }
  
  // Function to play jump sound
  function playJumpSound() {
    // Bouncy jump sound
    playSound(300, 0.05, 'sine');
    setTimeout(() => playSound(500, 0.1, 'sine'), 50);
    setTimeout(() => playSound(700, 0.15, 'sine'), 100);
  }
  
  // Function to play landing sound
  function playLandSound() {
    // Thud landing sound
    playSound(300, 0.1, 'sine');
    setTimeout(() => playSound(150, 0.2, 'sine'), 50);
  }
  
  // Function to play cupcake collection sound
  function playCupcakeSound() {
    // Happy collection sound - ascending notes
    playSound(523.25, 0.1, 'sine'); // C5
    setTimeout(() => playSound(659.25, 0.1, 'sine'), 100); // E5
    setTimeout(() => playSound(783.99, 0.1, 'sine'), 200); // G5
    setTimeout(() => playSound(1046.50, 0.2, 'sine'), 300); // C6
    
    // Add a pleasant sparkle sound
    setTimeout(() => {
      playSound(1800, 0.1, 'sine');
      playSound(2000, 0.15, 'triangle');
    }, 400);
  }
  
  return {
    playSound,
    playJumpSound,
    playLandSound,
    playCupcakeSound
  };
}