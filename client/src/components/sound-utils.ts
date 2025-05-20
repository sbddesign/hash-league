// Base64 encoded short laser sound (WAV format)
const LASER_SOUND_BASE64 = 'UklGRpQIAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXAIAACAgICAc2dnaHN0cn2Eg4B+fXt4dXRzcnN0dnh6fYKGiYuMjIuJh4WCf3t4c3BubGxsbXBydnp/hIiMj5KUlZWUkpCNioaDgHx4dXJvbGtqamtsbXBzdXh7foKFiIuNj5GSkpKRj42LiIWCf3x5dnNxb21sa2prbG1ucHJ0d3p9gIOGiYuNj5GSk5STkY+NioiEgn97eHVycG5sa2pqamtsbW9xc3Z5fH+ChYiKjI6QkZKSkZCOjImGg4B9end0cW9tbGtqamtrbG1vcXN1eHt9gIOFiIqMjpCRkpKSkI6MioeDgH57eHVycG9tbGtra2tsbW5wcnR3eXx/gYSGiYuNj5CRkpKRkI6MioeDgH57eHVycG9tbGtqamtsbW5wcnR2eXx+gYOGiIqMjpCRkpKRkI6MioiEgX57eXZzcW9tbGtqamtrbG1vcXN1eHp9gIKFh4mMjY+QkZKRkI+NioiEgn97eXZzcW9tbGtqamtrbG1vcHJ1d3p8f4GEhomLjY6QkZGRkI+NioiEgn98eXZzcW9tbGtqamtrbG1vcHJ0d3l8f4GDhYiKjI2PkJGRkY+NjImGg4B9end0cXBubGtqamtrbG1vcHJ0dnh7fYCChYeJi42PkJGRkY+NjImGg4B+e3h1cnBubGxramtrbG1vcHJ0dnh7fX+ChYeJi42OkJGRkZCOjImHhIJ/fHl2c3FvbmxramtrbGxtb3Fyc3Z4e31/goSGiYuMjpCQkZGPjoyJhoSBfnt4dXJwbm1sampramprbGxtbm9xc3V3eXt9f4KFh4mLjY6PkJCQj46MioiEgX57eXZzcW9tbGtqampqa2xsbW5wcnR2eHp8foGDhYeJi42OkJCQkI+NjIqHhIF+e3h1cnBubWxramppamtsbG1vcHJ0dXd5fH6AgYOFiIqMjY+PkJCPjoyKiISBfnx5dnNxb25samppampra2xtbnBxc3V3eXt9f4GDhYeKi42OkJCQkI+NjIqHhIF+e3h1cnBubWxrampqamtrbG1vcHJ0dXd5e31/gYOFh4mLjY6PkJCQj46MioeFgn98eXZzcW9ubGtqampqa2tsbW9wcnR2eHp8foGDhYeJi42Oj4+QkI+OjIqIhYJ/fHl2c3Fvbmxramppampra2xub3Fyc3V3eXt9f4GDhYeJi4yOj5CQkI+OjIqIhYJ/fHl2c3FvbmxrampqamprbGxtbnBydHZ4ent9f4GDhYeJi42Oj5CQkI+OjIqIhYJ/fHl2c3FvbmxrampqamprbGxtbnBydHZ4ent9f4GDhYeJi42Oj5CQkI+OjIqIhYJ/fHl2c3Fvbmxramppampqa2xsbW5wcnR2eHp7fX+Bg4WHiYuNjo+QkJCPjoyKiIWCf3x5dnNxb25sa2pqampqa2tsbW5wcnR2eHp7fX+Bg4WHiYuNjo+QkJCPjoyKiIWCf3x5dnNxb25sa2pqampqa2tsbW9wcnR2eHp7fX+Bg4WHiYuNjo+QkJCPjoyKiIWCf3x5dnNxb25sa2pqampqa2tsbW9wcnR2eHp7fX+Bg4WHiYuNjo+QkJCPjoyKiIWCf3x5dnNxb25sa2pqampqa2tsbW5wcnR2eHp7fX+Bg4WHiYuNjo+QkJCPjoyKiIWCf3x5dnNxb25sa2pqampqa2tsbW5wcnR2eHp7fX+Bg4WHiYuNjo+QkJCPjoyKiIWCf3x5dnNxb25sa2pqampqa2tsbW5wcnR2eHp7fX+Bg4WHiYuNjo+QkJCPjoyKiIWCf3x5dnNxb25sa2pqampqa2tsbW5wcnR2eHp7fX+Bg4WHiYuNjo+QkJCPjoyKiIWCf3x5dnNxb25sa2pqampqa2tsbW5wcnR2eHp7fX+Bg4WHiYuNjo+QkJCPjoyKiIWCf3x5dnNxb25sa2pqampqa2tsbW5wcnR2eHp7fX+Bg4WHiYuNjo+QkJCPjoyKiIWCf3x5dnNxb25sa2pqampqa2tsbW5wcnR2eHp7fX+Bg4WHiYuNjo+QkJCPjoyKiIWCf3x5dnNxbw==';

/**
 * Plays a quick laser sound effect for notifications
 */
export function playLaserSound(volume = 0.5): void {
  try {
    // Create a context for playing audio
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.warn('AudioContext not supported in this browser');
      return;
    }
    
    const context = new AudioContext();
    
    // Convert base64 to array buffer
    const binaryString = window.atob(LASER_SOUND_BASE64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Decode the audio data and play it
    context.decodeAudioData(
      bytes.buffer,
      (buffer) => {
        const source = context.createBufferSource();
        source.buffer = buffer;
        
        // Create a gain node to control volume
        const gainNode = context.createGain();
        gainNode.gain.value = volume;
        
        // Connect the source to the gain node
        source.connect(gainNode);
        
        // Connect the gain node to the destination (speakers)
        gainNode.connect(context.destination);
        
        // Play the sound
        source.start(0);
      },
      (error) => {
        console.error('Error decoding audio data:', error);
      }
    );
  } catch (err) {
    console.error('Error playing sound:', err);
  }
}