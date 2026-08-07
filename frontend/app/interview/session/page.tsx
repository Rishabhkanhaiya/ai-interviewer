'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { useSearchParams, useRouter } from 'next/navigation';

const LOADING_MESSAGES = [
  "Connecting to secure server...",
  "Waking up the AI interviewer...",
  "Reviewing your profile...",
  "Preparing the interview environment...",
  "Almost ready...",
];

function ConnectingLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="animate-pulse transition-opacity duration-500">
      {LOADING_MESSAGES[msgIndex]}
    </span>
  );
}

const PROCESSING_MESSAGES = [
  "Reviewing your answer...",
  "Taking notes...",
  "Preparing next question...",
  "Analyzing response...",
];

function ProcessingLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    // Cycle text
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="animate-pulse transition-opacity duration-500">
      {PROCESSING_MESSAGES[msgIndex]}
    </span>
  );
}

function InterviewSessionInner() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get('session_id')!;
  const authToken = params.get('token') || 'dummy-token';
  const company = params.get('company') || 'Interview';
  const roundType = params.get('round_type') || '';

  const [showEndWarning, setShowEndWarning] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const {
    state,
    transcript,
    currentQuestion,
    questionNumber,
    error,
    started,
    startInterview,
    submitAnswer,
    bargeIn,
    isAiSpeaking,
    isUserTurn,
    isProcessing,
    endSession,
  } = useInterview(sessionId, authToken);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (started) {
      interval = setInterval(() => {
        setSessionSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [started]);

  function handleConfirmEnd() {
    endSession();
    setShowEndWarning(false);
    router.push(`/interview/scorecard/${sessionId}`);
  }

  // ── Pre-start screen (Fix 2 — AudioContext created inside click handler) ──
  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-6">🎙️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{company}</h1>
          <p className="text-gray-500 text-sm mb-1 capitalize">{roundType.replace('_', ' ')} round</p>
          <p className="text-gray-400 text-xs mb-8">Make sure your microphone and speakers are ready</p>

          <button
            onClick={startInterview}  /* Fix 2 — gesture handler */
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-md"
          >
            Start Interview →
          </button>

          <p className="text-xs text-gray-400 mt-4">
            1 round will be deducted from your pack when you start
          </p>
        </div>
      </div>
    );
  }

  // ── Active session ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative">

      {/* End Session Warning Modal */}
      {showEndWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">End session early?</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                If you leave now, <strong>1 interview round will be deducted</strong> from your pack.
                Your session will be marked as incomplete and no scorecard will be generated.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndWarning(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Keep going
              </button>
              <button
                onClick={handleConfirmEnd}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                End &amp; lose 1 round
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="fixed top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm z-40">
          {error}
        </div>
      )}

      {/* End Session button — top right */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-3">
        {/* Timer */}
        <div className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg shadow-sm flex items-center gap-2">
          <span className={sessionSeconds > 0 ? "animate-pulse text-indigo-500" : ""}>⏱️</span>
          <span className="tabular-nums">
            {Math.floor(sessionSeconds / 60).toString().padStart(2, '0')}:
            {(sessionSeconds % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <button
          onClick={() => setShowEndWarning(true)}
          className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors shadow-sm"
        >
          ✕ End Session
        </button>
      </div>

      {/* AI Status avatar */}
      <div className="mb-8 text-center">
        <div className="relative inline-block mx-auto mb-4">
          {/* Animated glow rings */}
          {isAiSpeaking && (
            <div className="absolute inset-0 rounded-full animate-ping bg-indigo-400 opacity-20"></div>
          )}
          {isUserTurn && (
            <div className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20" style={{ animationDuration: '2s' }}></div>
          )}
          
          <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${
            isAiSpeaking ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 scale-110 ring-4 ring-indigo-200 ring-offset-4 shadow-indigo-300/50' :
            isUserTurn   ? 'bg-gradient-to-tr from-green-400 to-emerald-500 scale-105 ring-4 ring-green-200 ring-offset-4 shadow-green-300/50' :
            isProcessing ? 'bg-gradient-to-tr from-amber-300 to-orange-400 animate-pulse' :
            'bg-gray-100 border-2 border-gray-200'
          }`}>
            <span className={`text-4xl transition-transform duration-300 ${isAiSpeaking ? 'animate-bounce' : ''}`}>
              {isAiSpeaking ? '🗣️' : isUserTurn ? '🎙️' : isProcessing ? '⏳' : '🤖'}
            </span>
          </div>
        </div>
        <p className={`text-sm font-semibold tracking-wide uppercase mt-2 ${
          isAiSpeaking ? 'text-indigo-600' : isUserTurn ? 'text-green-600' : isProcessing ? 'text-amber-600' : 'text-gray-500'
        }`}>
          {state === 'connecting' && <ConnectingLoader />}
          {isAiSpeaking && 'AI is speaking...'}
          {isUserTurn && 'Listening to you...'}
          {isProcessing && <ProcessingLoader />}
        </p>
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <div className="max-w-2xl w-full bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <p className="text-xs text-gray-400 mb-2">Question {questionNumber}</p>
          <p className="text-gray-800 text-lg leading-relaxed">{currentQuestion}</p>
        </div>
      )}

      {/* Live Transcript */}
      <div className="max-w-2xl w-full bg-white rounded-xl border border-gray-200 p-4 mb-6 h-44 overflow-y-auto">
        <p className="text-xs text-gray-400 mb-2">Live transcript</p>
        {transcript.map((entry, i) => (
          <p key={i} className={`text-sm mb-1 ${
            entry.speaker === 'ai' ? 'text-indigo-600' : 'text-gray-700'
          }`}>
            <span className="font-medium">{entry.speaker === 'ai' ? 'AI: ' : 'You: '}</span>
            {entry.text}
          </p>
        ))}
        {transcript.length === 0 && (
          <p className="text-gray-300 text-sm">Transcript will appear here...</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center">
        {isAiSpeaking && (
          <button
            onClick={bargeIn}
            className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            ✋ Interrupt
          </button>
        )}

        {isUserTurn && (
          <button
            onClick={submitAnswer}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-medium text-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            ✓ Done Answering
          </button>
        )}

        {isProcessing && (
          <div className="px-8 py-4 bg-gray-100 text-gray-400 rounded-xl font-medium text-lg">
            Processing...
          </div>
        )}
      </div>

      {isUserTurn && (
        <p className="mt-4 text-xs text-green-600 animate-pulse">
          🔴 Recording — speak now
        </p>
      )}
    </div>
  );
}

export default function InterviewSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading session...</div>
      </div>
    }>
      <InterviewSessionInner />
    </Suspense>
  );
}
