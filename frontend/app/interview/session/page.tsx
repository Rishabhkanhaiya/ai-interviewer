'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { useSearchParams, useRouter } from 'next/navigation';
import { PresenceCheck } from '@/components/interview/PresenceCheck';

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
  const cameraMode = params.get('camera_mode') || 'video';

  const [showEndWarning, setShowEndWarning] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showSoftNudge, setShowSoftNudge] = useState(false);
  const [isHardPaused, setIsHardPaused] = useState(false);

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

  // Read the global website theme from the HTML root element
  const [isDark, setIsDark] = useState(true);
  
  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDark(theme === 'dark');
    };
    checkTheme();
    
    // Listen for theme changes if the user toggles it elsewhere in the app
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  
  // Liquid Background Layer
  const liquidBackground = (
    <div className={`fixed inset-0 z-0 transition-colors duration-1000 overflow-hidden ${isDark ? 'bg-gray-950' : 'bg-indigo-50'}`}>
      <div className={`absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-pulse ${isDark ? 'bg-indigo-900/60' : 'bg-purple-300/50'}`} style={{ animationDuration: '8s' }}></div>
      <div className={`absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-pulse ${isDark ? 'bg-purple-900/60' : 'bg-indigo-300/50'}`} style={{ animationDuration: '10s' }}></div>
      <div className={`absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-[150px] opacity-70 animate-pulse ${isDark ? 'bg-blue-900/50' : 'bg-pink-300/40'}`} style={{ animationDuration: '12s' }}></div>
    </div>
  );

  const glassPanelClass = `relative z-10 backdrop-blur-2xl border transition-all duration-500 shadow-2xl ${
    isDark 
      ? 'bg-[var(--color-surface)]/5 border-white/10 shadow-black/50 text-white' 
      : 'bg-[var(--color-surface)]/40 border-white/60 shadow-indigo-900/10 text-[var(--color-text-primary)]'
  }`;

  const textPrimary = isDark ? 'text-white' : 'text-[var(--color-text-primary)]';
  const textSecondary = isDark ? 'text-gray-300' : 'text-[var(--color-text-secondary)]';
  const textTertiary = isDark ? 'text-gray-400' : 'text-[var(--color-text-tertiary)]';

  // ── Pre-start screen ──
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
        {liquidBackground}
        <div className={`rounded-3xl p-10 max-w-md w-full text-center ${glassPanelClass}`}>
          <div className="text-6xl mb-6">🎙️</div>
          <h1 className={`text-3xl font-bold mb-2 ${textPrimary}`}>{company}</h1>
          <p className={`text-sm mb-1 capitalize ${textSecondary}`}>{roundType.replace('_', ' ')} round</p>
          <p className={`text-xs mb-8 ${textTertiary}`}>Make sure your microphone and speakers are ready</p>

          <button
            onClick={startInterview}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:scale-[1.02] active:scale-95 ${
              isDark 
                ? 'bg-[var(--color-surface)]/10 hover:bg-[var(--color-surface)]/20 text-white border border-white/20' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
            }`}
          >
            Start Interview →
          </button>

          <p className={`text-xs mt-6 ${textTertiary}`}>
            1 round will be deducted from your pack when you start
          </p>
        </div>
      </div>
    );
  }

  // ── Active session ─────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-1000 ${textPrimary}`}>
      
      {liquidBackground}

      {/* Presence Check */}
      {started && cameraMode === 'video' && (
        <PresenceCheck
          isActive={started && !isHardPaused}
          onSoftNudge={() => setShowSoftNudge(true)}
          onHardPause={() => setIsHardPaused(true)}
          onPresenceChange={(isPresent) => {
            if (isPresent) {
              setShowSoftNudge(false);
              setIsHardPaused(false);
            }
          }}
        />
      )}

      {/* Hard Pause Overlay */}
      {isHardPaused && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-xl">
          <div className={`rounded-3xl p-10 max-w-lg w-full mx-4 text-center ${glassPanelClass}`}>
            <div className="text-6xl mb-6">⏸️</div>
            <h2 className="text-2xl font-bold mb-4">Session Paused</h2>
            <p className={`text-lg mb-8 ${textSecondary}`}>
              We couldn't detect your face for 20 seconds. Please return to the camera frame to resume the interview automatically.
            </p>
          </div>
        </div>
      )}

      {/* End Session Warning Modal */}
      {showEndWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className={`rounded-3xl p-8 max-w-md w-full mx-4 text-center ${glassPanelClass}`}>
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2">End session early?</h2>
            <p className={`text-sm leading-relaxed mb-8 ${textSecondary}`}>
              If you leave now, <strong>1 interview round will be deducted</strong> from your pack.
              Your session will be marked as incomplete and no scorecard will be generated.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndWarning(false)}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors border ${
                  isDark ? 'bg-[var(--color-surface)]/5 hover:bg-[var(--color-surface)]/10 border-white/10 text-white' : 'bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)]/80 border-white/60 text-[var(--color-text-primary)]'
                }`}
              >
                Keep going
              </button>
              <button
                onClick={handleConfirmEnd}
                className="flex-1 px-4 py-3 bg-red-500/80 hover:bg-red-500 text-white rounded-xl font-medium transition-colors backdrop-blur-md border border-red-400/50 shadow-lg shadow-red-500/20"
              >
                End &amp; lose round
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="fixed top-20 left-4 right-4 bg-red-500/20 backdrop-blur-md border border-red-500/50 rounded-xl p-4 text-red-200 text-sm z-40 text-center font-medium shadow-lg">
          {error}
        </div>
      )}

      {/* Soft Nudge Banner */}
      {showSoftNudge && !isHardPaused && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-amber-500/20 backdrop-blur-md border border-amber-500/50 rounded-full px-6 py-2 text-amber-200 text-sm font-medium z-40 shadow-lg animate-bounce">
          Please stay in the camera frame
        </div>
      )}

      {/* End Session button — top right */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-3">
        {/* Timer */}
        <div className={`px-4 py-2 rounded-xl backdrop-blur-md border text-sm font-medium shadow-lg flex items-center gap-2 ${
          isDark ? 'bg-[var(--color-surface)]/10 border-white/20 text-white' : 'bg-[var(--color-surface)]/50 border-white/60 text-[var(--color-text-primary)]'
        }`}>
          <span className={sessionSeconds > 0 ? "animate-pulse text-indigo-400" : ""}>⏱️</span>
          <span className="tabular-nums">
            {Math.floor(sessionSeconds / 60).toString().padStart(2, '0')}:
            {(sessionSeconds % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <button
          onClick={() => setShowEndWarning(true)}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 text-sm font-medium rounded-xl transition-colors backdrop-blur-md shadow-lg"
        >
          ✕ End Session
        </button>
      </div>

      {/* Main Glass Panel */}
      <div className={`w-full max-w-3xl rounded-3xl p-8 flex flex-col items-center ${glassPanelClass}`}>
        
        {/* AI Status avatar */}
        <div className="mb-8 text-center">
          <div className="relative inline-block mx-auto mb-4">
            {/* Animated glow rings */}
            {isAiSpeaking && (
              <div className="absolute inset-0 rounded-full animate-ping bg-indigo-500 opacity-30"></div>
            )}
            {isUserTurn && (
              <div className="absolute inset-0 rounded-full animate-ping bg-emerald-400 opacity-30" style={{ animationDuration: '2s' }}></div>
            )}
            
            <div className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl backdrop-blur-xl border-2 ${
              isAiSpeaking ? 'bg-indigo-500/20 border-indigo-400/50 scale-110 shadow-indigo-500/30' :
              isUserTurn   ? 'bg-emerald-500/20 border-emerald-400/50 scale-105 shadow-emerald-500/30' :
              isProcessing ? 'bg-amber-500/20 border-amber-400/50 animate-pulse' :
              isDark ? 'bg-[var(--color-surface)]/5 border-white/10' : 'bg-[var(--color-surface)]/30 border-white/50'
            }`}>
              <span className={`text-5xl transition-transform duration-300 ${isAiSpeaking ? 'animate-bounce' : ''}`}>
                {isAiSpeaking ? '🗣️' : isUserTurn ? '🎙️' : isProcessing ? '⏳' : '🤖'}
              </span>
            </div>
          </div>
          <p className={`text-sm font-bold tracking-widest uppercase mt-4 ${
            isAiSpeaking ? 'text-indigo-400' : isUserTurn ? 'text-emerald-400' : isProcessing ? 'text-amber-400' : textTertiary
          }`}>
            {state === 'connecting' && <ConnectingLoader />}
            {isAiSpeaking && 'AI is speaking...'}
            {isUserTurn && 'Listening to you...'}
            {isProcessing && <ProcessingLoader />}
          </p>
        </div>

        {/* Current Question & Live Transcript Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
          
          {/* Current Question */}
          <div className={`rounded-2xl p-6 border transition-colors ${
            isDark ? 'bg-[var(--color-surface)]/5 border-white/10' : 'bg-[var(--color-surface)]/40 border-white/50'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${currentQuestion ? 'bg-indigo-400 animate-pulse' : 'bg-gray-500'}`}></div>
              <p className={`text-xs uppercase tracking-wider font-semibold ${textTertiary}`}>Question {questionNumber || '-'}</p>
            </div>
            {currentQuestion ? (
              <p className={`text-lg leading-relaxed font-medium ${textPrimary}`}>{currentQuestion}</p>
            ) : (
              <p className={`text-sm italic ${textTertiary}`}>Waiting for question...</p>
            )}
          </div>

          {/* Live Transcript */}
          <div className={`rounded-2xl p-6 border transition-colors flex flex-col h-48 ${
            isDark ? 'bg-[var(--color-surface)]/5 border-white/10' : 'bg-[var(--color-surface)]/40 border-white/50'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${transcript.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`}></div>
              <p className={`text-xs uppercase tracking-wider font-semibold ${textTertiary}`}>Live Transcript</p>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {transcript.map((entry, i) => (
                <div key={i} className={`text-sm leading-relaxed ${
                  entry.speaker === 'ai' 
                    ? (isDark ? 'text-indigo-300' : 'text-indigo-700') 
                    : (isDark ? 'text-gray-200' : 'text-[var(--color-text-primary)]')
                }`}>
                  <span className={`font-bold mr-2 opacity-70`}>{entry.speaker === 'ai' ? 'AI' : 'You'}</span>
                  {entry.text}
                </div>
              ))}
              {transcript.length === 0 && (
                <p className={`text-sm italic ${textTertiary}`}>Transcript will appear here...</p>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 items-center h-16">
          {isAiSpeaking && (
            <button
              onClick={bargeIn}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all backdrop-blur-md border hover:scale-105 active:scale-95 ${
                isDark 
                  ? 'bg-[var(--color-surface)]/10 hover:bg-[var(--color-surface)]/20 border-white/20 text-white' 
                  : 'bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)]/70 border-white/60 text-[var(--color-text-primary)] shadow-sm'
              }`}
            >
              ✋ Interrupt
            </button>
          )}

          {isUserTurn && (
            <div className="flex flex-col items-center">
              <button
                onClick={submitAnswer}
                className="px-10 py-4 bg-emerald-500/80 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg transition-all backdrop-blur-md border border-emerald-400/50 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
              >
                ✓ Done Answering
              </button>
              <p className="mt-3 text-xs font-bold text-emerald-400 animate-pulse uppercase tracking-widest">
                🔴 Recording
              </p>
            </div>
          )}

          {isProcessing && (
            <div className={`px-10 py-4 rounded-xl font-bold text-lg backdrop-blur-md border flex items-center gap-3 ${
              isDark ? 'bg-[var(--color-surface)]/5 border-white/10 text-white/50' : 'bg-[var(--color-surface)]/30 border-white/40 text-[var(--color-text-tertiary)]'
            }`}>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          )}
        </div>

      </div>
      
      {/* Custom Scrollbar Styles for Transcript */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
          border-radius: 4px;
        }
      `}} />
    </div>
  );
}

export default function InterviewSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <InterviewSessionInner />
    </Suspense>
  );
}
