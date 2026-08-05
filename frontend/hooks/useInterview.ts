'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { InterviewSocketManager, SessionState, TranscriptEntry } from '@/lib/interviewSocket';

export function useInterview(sessionId: string, authToken: string) {
  const managerRef = useRef<InterviewSocketManager | null>(null);
  const [state, setState] = useState<SessionState>('connecting');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionNumber, setQuestionNumber] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Guard: only run once (prevents React Strict Mode double-effect)
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
      // Navigate to scorecard
      window.location.href = `/interview/scorecard/${id}`;
    };

    manager.connect(sessionId, authToken);

    return () => {
      // Cleanup on unmount
      manager.disconnect();
      managerRef.current = null;
    };
  }, [sessionId, authToken]); // Fixed deps

  const submitAnswer = useCallback(async () => {
    await managerRef.current?.submitAnswer();
  }, []);

  const bargeIn = useCallback(() => {
    managerRef.current?.bargeIn();
  }, []);

  return {
    state,
    transcript,
    currentQuestion,
    questionNumber,
    error,
    submitAnswer,
    bargeIn,
    isAiSpeaking: state === 'ai_speaking',
    isUserTurn: state === 'user_turn',
    isProcessing: state === 'processing',
  };
}
