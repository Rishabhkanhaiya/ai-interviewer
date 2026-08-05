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

export class InterviewSocketManager {
  private ws: WebSocket | null = null;
  private audioEngine: AudioQueueManager;
  private micRecorder: MicRecorderManager;
  private connectionGuard = false;   // Prevents React Strict Mode double-mount

  // Callbacks for React component to update UI
  onStateChange?: (state: SessionState) => void;
  onTranscriptUpdate?: (entry: TranscriptEntry) => void;
  onQuestionDisplay?: (text: string, questionNumber: number) => void;
  onScoreUpdate?: (data: object) => void;
  onSessionEnd?: (sessionId: string) => void;
  onError?: (message: string) => void;

  constructor() {
    this.audioEngine = new AudioQueueManager(
      () => this.onStateChange?.('ai_speaking'),
      () => this.onStateChange?.('user_turn')
    );
    this.micRecorder = new MicRecorderManager();
  }

  async connect(sessionId: string, authToken: string): Promise<void> {
    // CRITICAL: Prevent double connection from React Strict Mode
    if (this.connectionGuard) return;
    this.connectionGuard = true;

    // Initialize mic before connecting WebSocket
    const micReady = await this.micRecorder.initialize();
    if (!micReady) {
      this.onError?.('Microphone access denied. Please allow microphone and refresh.');
      return;
    }

    // Resume AudioContext (requires user gesture — this is called from a button click)
    await this.audioEngine.resume();

    const wsUrl = `${process.env.NEXT_PUBLIC_API_URL!.replace('https', 'wss')}/ws/interview/${sessionId}?token=${authToken}`;
    
    this.ws = new WebSocket(wsUrl);
    this.onStateChange?.('connecting');

    this.ws.onopen = () => {
      console.log('[InterviewSocket] Connected');
      // Backend will immediately send the first question
    };

    this.ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      await this.handleMessage(message);
    };

    this.ws.onclose = (event) => {
      if (event.code !== 1000) {
        // Abnormal close — don't reconnect, show error
        this.onError?.('Connection lost. Please refresh and try again.');
      }
    };

    this.ws.onerror = (error) => {
      console.error('[InterviewSocket] WebSocket error:', error);
      this.onError?.('Connection error. Check your internet and try again.');
    };
  }

  private async handleMessage(message: { type: string; [key: string]: unknown }) {
    switch (message.type) {

      case 'question':
      case 'question_audio_continuation': {
        // Backend sends complete question text + audio
        const { text, audio_base64, question_number } = message as unknown as {
          text?: string;
          audio_base64: string;
          question_number?: number;
        };
        
        // Display question text immediately (before audio plays)
        if (text && question_number) {
          this.onQuestionDisplay?.(text, question_number);
          this.onTranscriptUpdate?.({ speaker: 'ai', text, timestamp: Date.now() });
        }
        
        // Queue audio for playback
        // AudioQueueManager will call onPlaybackEnd → triggers user_turn state
        if (audio_base64) {
          await this.audioEngine.enqueue(audio_base64);
        }
        break;
      }

      case 'user_turn': {
        // Explicit signal that it's user's turn (if audio was skipped)
        this.onStateChange?.('user_turn');
        this.micRecorder.startRecording();
        break;
      }

      case 'transcript_update': {
        // Partial transcript from STT during processing (optional)
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

  /**
   * Called when user clicks "Done Answering".
   * Stops recording, sends audio to backend for STT processing.
   */
  async submitAnswer(): Promise<void> {
    this.onStateChange?.('processing');
    
    const audioBlob = await this.micRecorder.stopRecording();
    if (!audioBlob || audioBlob.size < 1000) {
      // Audio too short — ask user to try again
      this.onError?.('Answer too short. Please speak for at least 2 seconds.');
      this.onStateChange?.('user_turn');
      this.micRecorder.startRecording();
      return;
    }

    // Convert blob to base64 to send over WebSocket
    const base64 = await this.blobToBase64(audioBlob);
    
    // Send to backend
    this.ws?.send(JSON.stringify({
      type: 'submit_answer',
      audio_base64: base64,
      audio_format: audioBlob.type,  // e.g., 'audio/webm;codecs=opus'
    }));
  }

  /**
   * Barge-in: stop AI speaking if user starts talking.
   * Connect this to VAD or a manual button.
   */
  bargeIn(): void {
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

  /**
   * Clean disconnect on session end or component unmount.
   */
  async disconnect(): Promise<void> {
    this.micRecorder.destroy();
    await this.audioEngine.destroy();
    this.ws?.close(1000, 'Session ended normally');
    this.ws = null;
    this.connectionGuard = false;
  }
}
