/**
 * AudioQueueManager
 *
 * Fix 3: hasFiredPlaybackStart tracks whether ai_speaking has been fired for
 * the current utterance. Fires on the FIRST chunk, not the last.
 * Reset on stopAll() (barge-in) so next utterance re-fires correctly.
 *
 * Fix 2: AudioContext is created lazily inside resume(), which must be called
 * synchronously from a user gesture handler — never in a useEffect.
 */
export class AudioQueueManager {
  private context: AudioContext | null = null;
  private queue: AudioBuffer[] = [];
  private nextStartTime = 0;           // schedules chunks gaplessly
  private currentSource: AudioBufferSourceNode | null = null;
  private isPlaying = false;
  private isStopped = false;
  private hasFiredPlaybackStart = false;  // Fix 3

  private onPlaybackStart?: () => void;
  private onPlaybackEnd?: () => void;

  constructor(
    onPlaybackStart?: () => void,
    onPlaybackEnd?: () => void,
  ) {
    this.onPlaybackStart = onPlaybackStart;
    this.onPlaybackEnd = onPlaybackEnd;
    // Fix 2: Do NOT create AudioContext here.
    // Browser blocks audio if context is created before a user gesture.
  }

  /**
   * Fix 2 — call this synchronously inside the click handler that starts the interview.
   * Creates the AudioContext if it doesn't exist yet, then resumes it.
   */
  async resume(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  /**
   * Enqueue a base64 WAV chunk for playback.
   * Fix 3: fires onPlaybackStart (→ ai_speaking) on the FIRST chunk.
   */
  async enqueue(base64Wav: string): Promise<void> {
    if (this.isStopped) return;

    // Ensure context is alive — resume if suspended
    if (!this.context) {
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') {
      try { await this.context.resume(); } catch { /* ignore */ }
    }

    try {
      const binaryStr = atob(base64Wav);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const audioBuffer = await this.context.decodeAudioData(bytes.buffer);

      // Fix 3: fire ai_speaking on FIRST chunk, not when queue empties
      if (!this.hasFiredPlaybackStart) {
        this.hasFiredPlaybackStart = true;
        this.onPlaybackStart?.();
      }

      this.scheduleChunk(audioBuffer);

    } catch (err) {
      console.error('[AudioEngine] Failed to decode chunk:', err);
    }
  }

  private scheduleChunk(buffer: AudioBuffer): void {
    if (!this.context || this.isStopped) return;

    const source = this.context.createBufferSource();
    source.buffer = buffer;

    const compressor = this.context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, this.context.currentTime);
    compressor.knee.setValueAtTime(30, this.context.currentTime);
    compressor.ratio.setValueAtTime(12, this.context.currentTime);
    compressor.attack.setValueAtTime(0.003, this.context.currentTime);
    compressor.release.setValueAtTime(0.25, this.context.currentTime);

    source.connect(compressor);
    compressor.connect(this.context.destination);

    // Schedule gaplessly — each chunk starts exactly where the last ended
    const startTime = Math.max(this.context.currentTime, this.nextStartTime);
    source.start(startTime);
    this.nextStartTime = startTime + buffer.duration;
    this.isPlaying = true;

    this.currentSource = source;

    source.onended = () => {
      this.currentSource = null;
      // Check if nothing else is scheduled (queue drained)
      if (this.context && this.context.currentTime >= this.nextStartTime - 0.05) {
        this.isPlaying = false;
        this.onPlaybackEnd?.();
        // NOTE: do NOT reset hasFiredPlaybackStart here — 
        // more chunks may arrive for the same utterance.
        // It is reset in stopAll() on barge-in.
      }
    };
  }

  /**
   * Immediately stop all playback — call on barge-in.
   * Fix 3: reset hasFiredPlaybackStart so the NEXT utterance re-fires ai_speaking.
   */
  stopAll(): void {
    try { this.currentSource?.stop(); } catch { /* already ended */ }
    this.currentSource = null;
    this.queue = [];
    this.isPlaying = false;
    this.nextStartTime = 0;
    this.hasFiredPlaybackStart = false;  // Fix 3 — reset for next utterance
  }

  async destroy(): Promise<void> {
    this.isStopped = true;
    this.stopAll();
    await this.context?.close();
    this.context = null;
  }

  get playing(): boolean {
    return this.isPlaying;
  }
}
