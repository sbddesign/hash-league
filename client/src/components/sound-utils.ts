// Sound file paths for the external MP3 files
const BLOCK_SOUND_FILE_PATH = "/sounds/coins.mp3";
const HASHRATE_SOUND_FILE_PATH = "/sounds/charging.mp3";

/**
 * Plays the sound effect for new block notifications
 * Uses the external sound file from /sounds/laser.mp3
 */
export function playLaserSound(volume = 0.5): void {
  playSound(BLOCK_SOUND_FILE_PATH, volume);
}

export function playHashrateSound(volume = 0.5): void {
  playSound(HASHRATE_SOUND_FILE_PATH, volume);
}

function playSound(soundFilePath: string, volume = 0.5): void {
  try {
    // Try playing with Web Audio API for more reliable playback
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;

    if (AudioContext) {
      // Create audio context
      const context = new AudioContext();

      // Fetch the audio file
      fetch(soundFilePath)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load sound: ${response.status}`);
          }
          return response.arrayBuffer();
        })
        .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
          // Create audio source
          const source = context.createBufferSource();
          source.buffer = audioBuffer;

          // Create volume control
          const gainNode = context.createGain();
          gainNode.gain.value = volume;

          // Connect nodes
          source.connect(gainNode);
          gainNode.connect(context.destination);

          // Play sound
          source.start(0);
          console.log(`Playing sound with Web Audio API: ${soundFilePath}`);
        })
        .catch((error) => {
          console.error("Web Audio API error:", error);
          // Fall back to HTML5 Audio if Web Audio API fails
          playWithAudioElement(soundFilePath, volume);
        });
    } else {
      // Fall back to HTML5 Audio if Web Audio API is not available
      playWithAudioElement(soundFilePath, volume);
    }
  } catch (err) {
    console.error("Error playing sound:", err);
    // Final fallback to basic Audio
    playWithAudioElement(soundFilePath, volume);
  }
}

/**
 * Fallback method to play sound using HTML5 Audio element
 */
function playWithAudioElement(soundFilePath: string, volume = 0.5): void {
  try {
    const audio = new Audio(soundFilePath);
    audio.volume = volume;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("HTML5 Audio playback error:", error);
      });
    }
  } catch (err) {
    console.error("Error with HTML5 Audio:", err);
  }
}
