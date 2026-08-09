import { AudioQueueManager } from './audioEngine';
import { MicRecorderManager } from './mediaRecorder';

export type SessionState = 
  | 'connecting'
  | 'ai_speaking'     // AI is talking — show speaking animation
  | 'user_turn'       // User's turn — show mic + "Done" button
  | 'processing'      // Backend processing STT + next question
  | 'session_end';    // Session complete — redirect to scorecard

export interface TranscriptEntry {
  speaker: 'ai' | 'user';
  text: string;
  timestamp: number;
  fillerWords?: string[];
  wpm?: number;
}

// Fix 4 — explicit protocol mapping, no blind string replace
function getWsUrl(sessionId: string, authToken: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
  const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
  const host = apiUrl.replace(/^https?:\/\//, '');
  return `${wsProtocol}://${host}/ws/interview/${sessionId}?token=${authToken}`;
}

export class InterviewSocketManager {
  private ws: WebSocket | null = null;
  private isConnecting = false;
  private audioEngine: AudioQueueManager;
  private micRecorder: MicRecorderManager;
  private lastUserTurnStart: number = 0;

  // Callbacks for React component to update UI
  onStateChange?: (state: SessionState) => void;
  onTranscriptUpdate?: (entry: TranscriptEntry) => void;
  onQuestionDisplay?: (text: string, questionNumber: number) => void;
  onScoreUpdate?: (data: object) => void;
  onSessionEnd?: (sessionId: string) => void;
  onError?: (message: string) => void;

  constructor() {
    // Fix 3 — pass onPlaybackStart and onPlaybackEnd to AudioQueueManager
    this.audioEngine = new AudioQueueManager(
      () => this.onStateChange?.('ai_speaking'),  // fires on FIRST chunk
      () => {                                      // fires after LAST chunk ends
        this.onStateChange?.('user_turn');
        this.micRecorder.startRecording();
      }
    );
    this.micRecorder = new MicRecorderManager();
  }

  // Fix 2 — AudioContext MUST be created/resumed inside the gesture handler.
  // This method must be called synchronously from a click handler, not a useEffect.
  async initAudio(): Promise<void> {
    await this.audioEngine.resume();
  }

  async connect(sessionId: string, authToken: string): Promise<void> {
    // Fix 1 — guard against double-fire (StrictMode, re-render, etc.)
    if (this.isConnecting || this.ws) return;
    this.isConnecting = true;

    // Initialize mic
    const micReady = await this.micRecorder.initialize();
    if (!micReady) {
      this.isConnecting = false;
      this.onError?.('Microphone access denied. Please allow microphone and refresh.');
      return;
    }

    const wsUrl = getWsUrl(sessionId, authToken);
    const ws = new WebSocket(wsUrl);
    this.ws = ws;

    this.onStateChange?.('connecting');

    ws.onopen = () => {
      this.isConnecting = false;
      console.log('[InterviewSocket] Connected to', wsUrl);
      // Backend sends first question immediately after open
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      await this.handleMessage(message);
    };

    ws.onclose = (event) => {
      // Only clear if this is still the active socket
      if (this.ws === ws) this.ws = null;
      this.isConnecting = false;
      if (event.code !== 1000) {
        this.onError?.('Connection lost. Please refresh and try again.');
      }
    };

    ws.onerror = () => {
      this.onError?.('Connection error. Check your internet and try again.');
    };
  }

  private async handleMessage(message: { type: string; [key: string]: unknown }) {
    switch (message.type) {

      case 'question':
      case 'question_audio_continuation': {
        const { text, audio_base64, question_number, is_last } = message as unknown as {
          text?: string;
          audio_base64: string | null;
          question_number?: number;
          is_last?: boolean;
        };

        // Display text only on first segment (type === 'question') — prevents duplicates
        if (text && question_number !== undefined) {
          this.onQuestionDisplay?.(text, question_number);
          this.onTranscriptUpdate?.({ speaker: 'ai', text, timestamp: Date.now() });
        }

        if (audio_base64) {
          // Enqueue — AudioQueueManager fires onPlaybackStart on first chunk (Fix 3)
          await this.audioEngine.enqueue(audio_base64);
        } else if (is_last) {
          // TTS returned no audio on last segment — fallback so state doesn't freeze
          console.warn('[InterviewSocket] TTS returned no audio — falling through to user_turn');
          this.onStateChange?.('user_turn');
          this.micRecorder.startRecording();
        }
        break;
      }

      case 'user_turn': {
        this.onStateChange?.('user_turn');
        this.lastUserTurnStart = Date.now();
        this.micRecorder.startRecording();
        break;
      }

      case 'transcript_update': {
        const { text } = message as unknown as { text: string };
        this.onTranscriptUpdate?.({ speaker: 'user', text, timestamp: Date.now() });
        break;
      }

      case 'processing': {
        this.onStateChange?.('processing');
        break;
      }

      case 'session_end': {
        const { session_id } = message as unknown as { session_id: string };
        this.onStateChange?.('session_end');
        this.onSessionEnd?.(session_id);
        break;
      }

      case 'error': {
        const { message: errorMsg } = message as unknown as { message: string };
        this.onError?.(errorMsg);
        break;
      }
    }
  }
  async submitAnswer(): Promise<void> {
    this.onStateChange?.('processing');

    const audioBlob = await this.micRecorder.stopRecording();

    // Phase 9: Play acknowledgment filler if user spoke for > 5 seconds
    const turnDuration = Date.now() - this.lastUserTurnStart;
    if (turnDuration > 5000) {
      console.log(`[SUBMIT] Turn was ${turnDuration}ms. Playing filler audio...`);
      const fillers = ['/fillers/hmm.mp3', '/fillers/got_it.mp3', '/fillers/interesting.mp3'];
      const randomFiller = fillers[Math.floor(Math.random() * fillers.length)];
      const audio = new Audio(randomFiller);
      audio.play().catch(e => console.log('Filler playback skipped/failed (ensure files exist in public/fillers):', e));
    }

    // Fix A — Debug: check blob in browser console
    console.log('[SUBMIT] Audio blob:', audioBlob);
    console.log('[SUBMIT] Audio blob size:', audioBlob?.size, 'bytes');
    console.log('[SUBMIT] Audio blob type:', audioBlob?.type);

    if (!audioBlob) {
      console.error('[SUBMIT] audioBlob is null — MediaRecorder failed to produce audio');
      this.onError?.('Microphone not recording. Please refresh the page and allow mic access.');
      this.onStateChange?.('user_turn');
      this.micRecorder.startRecording();
      return;
    }

    if (audioBlob.size < 1000) {
      console.error('[SUBMIT] Audio too small:', audioBlob.size, 'bytes — likely silence');
      this.onError?.('Please speak for at least 3 seconds before clicking Done Answering.');
      this.onStateChange?.('user_turn');
      this.micRecorder.startRecording();
      return;
    }

    console.log('[SUBMIT] Sending audio to backend:', audioBlob.size, 'bytes,', audioBlob.type);
    const base64 = await this.blobToBase64(audioBlob);
    console.log('[SUBMIT] Base64 length:', base64.length);

    this.ws?.send(JSON.stringify({
      type: 'submit_answer',
      audio_base64: base64,
      audio_format: audioBlob.type || 'audio/webm;codecs=opus',
    }));
  }

  bargeIn(): void {
    // Fix 3 — reset hasFiredPlaybackStart on barge-in so next utterance re-fires ai_speaking
    this.audioEngine.stopAll();
    this.onStateChange?.('user_turn');
    this.micRecorder.startRecording();
    this.ws?.send(JSON.stringify({ type: 'barge_in' }));
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async disconnect(): Promise<void> {
    const ws = this.ws;
    this.ws = null;
    this.isConnecting = false;
    this.micRecorder.destroy();
    await this.audioEngine.destroy();
    ws?.close(1000, 'Session ended normally');
  }
}
