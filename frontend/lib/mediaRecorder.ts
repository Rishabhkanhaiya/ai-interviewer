/**
 * MicRecorderManager
 * 
 * Records user's voice using MediaRecorder API.
 * Produces a complete WebM/Opus blob when recording stops.
 * This blob is sent directly to the backend for Sarvam REST STT.
 * 
 * Why WebM/Opus: smallest file size, best quality, supported by all browsers.
 * Sarvam REST STT accepts WebM directly — no conversion needed.
 */
export class MicRecorderManager {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private isRecording: boolean = false;

  /**
   * Request microphone permission and initialize.
   * Call once on session start (not per question).
   */
  async initialize(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,           // Mono — saves bandwidth, Sarvam works with mono
          sampleRate: 16000,         // 16kHz — optimal for STT
          echoCancellation: true,    // Critical: prevents AI voice feeding back into mic
          noiseSuppression: true,    // Helps in hostel/dorm environments
          autoGainControl: true,     // Normalizes speaking volume
        }
      });
      return true;
    } catch (err) {
      console.error('[MicRecorder] Failed to get microphone:', err);
      return false;
    }
  }

  /**
   * Start recording a new answer.
   * Call when AI finishes speaking and hands over to user.
   */
  startRecording(): void {
    if (!this.stream || this.isRecording) return;

    this.chunks = [];

    // Prefer WebM/Opus — Sarvam supports it, great compression
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : 'audio/ogg;codecs=opus'; // Firefox fallback

    this.recorder = new MediaRecorder(this.stream, { mimeType });

    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    // Collect chunks every 1 second for live waveform visualization
    this.recorder.start(1000);
    this.isRecording = true;
  }

  /**
   * Stop recording and return the complete audio blob.
   * Call when user clicks "Done Answering".
   */
  stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.recorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.recorder.onstop = () => {
        const mimeType = this.recorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.chunks, { type: mimeType });
        this.isRecording = false;
        this.chunks = [];
        resolve(blob);
      };

      this.recorder.stop();
    });
  }

  /**
   * Get current audio level (0–100) for waveform visualisation.
   * Call every 100ms while recording.
   */
  getAudioLevel(): number {
    // Implement with AnalyserNode for waveform
    // Return 0 if not recording
    return this.isRecording ? Math.random() * 60 + 20 : 0; // Replace with real analyser
  }

  /**
   * Full cleanup on session end or component unmount.
   */
  destroy() {
    if (this.isRecording) {
      this.recorder?.stop();
    }
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.recorder = null;
    this.chunks = [];
    this.isRecording = false;
  }

  get recording() {
    return this.isRecording;
  }
}
