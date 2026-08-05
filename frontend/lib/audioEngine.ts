/**
 * AudioQueueManager
 * 
 * Manages sequential playback of TTS audio buffers.
 * Each sentence arrives as a complete base64 WAV string.
 * Sentences are decoded and queued for seamless sequential playback.
 * 
 * Industry standard: Web Audio API AudioContext with BufferSource nodes.
 */
export class AudioQueueManager {
  private context: AudioContext | null = null;
  private queue: AudioBuffer[] = [];
  private currentSource: AudioBufferSourceNode | null = null;
  private isPlaying: boolean = false;
  private isStopped: boolean = false;
  private onPlaybackStart?: () => void;
  private onPlaybackEnd?: () => void;

  constructor(
    onPlaybackStart?: () => void,
    onPlaybackEnd?: () => void
  ) {
    this.onPlaybackStart = onPlaybackStart;
    this.onPlaybackEnd = onPlaybackEnd;
    this.initContext();
  }

  private initContext() {
    // AudioContext must be created after user gesture (browser policy)
    // Call this inside a click handler if needed
    this.context = new AudioContext();
  }

  /**
   * Resume context if suspended (browser requires user gesture first)
   * Call this on first user interaction.
   */
  async resume() {
    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }
  }

  /**
   * Add a complete sentence audio to the playback queue.
   * @param base64Wav - Base64-encoded complete WAV audio from Sarvam TTS
   */
  async enqueue(base64Wav: string): Promise<void> {
    if (!this.context || this.isStopped) return;

    try {
      // Decode base64 to ArrayBuffer
      const binaryStr = atob(base64Wav);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer;

      // Decode the complete WAV — this works perfectly because it's a complete file
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      
      this.queue.push(audioBuffer);
      
      // Start playing if not already playing
      if (!this.isPlaying) {
        this.playNext();
      }
    } catch (err) {
      console.error('[AudioEngine] Failed to decode audio buffer:', err);
    }
  }

  private playNext() {
    if (this.isStopped || !this.context || this.queue.length === 0) {
      this.isPlaying = false;
      this.onPlaybackEnd?.();
      return;
    }

    this.isPlaying = true;
    const buffer = this.queue.shift()!;

    // Create a new source node for this buffer
    const source = this.context.createBufferSource();
    source.buffer = buffer;

    // Optional: add slight compression for consistent volume
    const compressor = this.context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, this.context.currentTime);
    compressor.knee.setValueAtTime(30, this.context.currentTime);
    compressor.ratio.setValueAtTime(12, this.context.currentTime);
    compressor.attack.setValueAtTime(0.003, this.context.currentTime);
    compressor.release.setValueAtTime(0.25, this.context.currentTime);

    source.connect(compressor);
    compressor.connect(this.context.destination);

    // When this buffer ends, play the next one
    source.onended = () => {
      this.currentSource = null;
      this.playNext();
    };

    this.currentSource = source;
    
    if (this.queue.length === 0) {
      // This is the last buffer — notify when it ends
      source.onended = () => {
        this.currentSource = null;
        this.isPlaying = false;
        this.onPlaybackEnd?.();
      };
    }

    source.start(0);
    
    if (this.queue.length === 0 && !this.isPlaying) {
      this.onPlaybackStart?.();
    }
  }

  /**
   * Immediately stop all playback and clear the queue.
   * Call this on barge-in (user starts speaking while AI is talking).
   */
  stopAll() {
    try {
      this.currentSource?.stop();
    } catch {
      // Source may have already ended — ignore
    }
    this.currentSource = null;
    this.queue = [];
    this.isPlaying = false;
  }

  /**
   * Full cleanup — call on component unmount.
   */
  async destroy() {
    this.isStopped = true;
    this.stopAll();
    await this.context?.close();
    this.context = null;
  }

  get playing() {
    return this.isPlaying;
  }
}
