'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { InterviewSocketManager, SessionState, TranscriptEntry } from '@/lib/interviewSocket';

export function useInterview(sessionId: string, authToken: string) {
  const managerRef = useRef<InterviewSocketManager | null>(null);
  // Fix 1: isConnectingRef prevents double-fire from re-renders or StrictMode
  const isConnectingRef = useRef(false);

  const [state, setState] = useState<SessionState>('connecting');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionNumber, setQuestionNumber] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  // Set up the manager once on mount — but don't connect yet.
  // Connection is triggered by startInterview() which fires from a button click.
  useEffect(() => {
    if (managerRef.current) return;

    const manager = new InterviewSocketManager();
    managerRef.current = manager;

    manager.onStateChange = (s) => setState(s);
    manager.onTranscriptUpdate = (entry) =>
      setTranscript(prev => [...prev, entry]);
    manager.onQuestionDisplay = (text, num) => {
      setCurrentQuestion(text);
      setQuestionNumber(num);
    };
    manager.onError = (msg) => setError(msg);
    manager.onSessionEnd = (id) => {
      window.location.href = `/interview/scorecard/${id}`;
    };

    return () => {
      manager.disconnect();
      managerRef.current = null;
      isConnectingRef.current = false;
    };
  }, [sessionId, authToken]);

  /**
   * Fix 2 — must be called synchronously from the click handler.
   * initAudio() creates/resumes AudioContext inside the gesture call stack.
   * connect() then opens the WebSocket after audio is ready.
   */
  const startInterview = useCallback(async () => {
    if (isConnectingRef.current) return;
    isConnectingRef.current = true;

    const manager = managerRef.current;
    if (!manager) return;

    try {
      // Fix 2: resume AudioContext synchronously in the gesture handler
      await manager.initAudio();
      // Connect WebSocket after audio is confirmed ready
      await manager.connect(sessionId, authToken);
      setStarted(true);
    } catch (e) {
      console.error('[useInterview] Failed to start:', e);
      isConnectingRef.current = false;
    }
  }, [sessionId, authToken]);

  const submitAnswer = useCallback(async () => {
    await managerRef.current?.submitAnswer();
  }, []);

  const bargeIn = useCallback(() => {
    managerRef.current?.bargeIn();
  }, []);

  const endSession = useCallback(() => {
    managerRef.current?.disconnect();
    managerRef.current = null;
    isConnectingRef.current = false;
  }, []);

  return {
    state,
    transcript,
    currentQuestion,
    questionNumber,
    error,
    started,
    startInterview,
    submitAnswer,
    bargeIn,
    endSession,
    isAiSpeaking: state === 'ai_speaking',
    isUserTurn: state === 'user_turn',
    isProcessing: state === 'processing',
  };
}
