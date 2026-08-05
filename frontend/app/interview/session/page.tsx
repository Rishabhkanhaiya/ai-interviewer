'use client';

import { useInterview } from '@/hooks/useInterview';
import { useSearchParams } from 'next/navigation';

export default function InterviewSession() {
  const params = useSearchParams();
  const sessionId = params.get('session_id')!;
  // TODO: Fix token param logic depending on how it's sent. Mocking for now:
  const authToken = params.get('token') || 'dummy-token'; 

  const {
    state,
    transcript,
    currentQuestion,
    questionNumber,
    error,
    submitAnswer,
    bargeIn,
    isAiSpeaking,
    isUserTurn,
    isProcessing,
  } = useInterview(sessionId, authToken);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      {/* Error banner */}
      {error && (
        <div className="fixed top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* AI Status */}
      <div className="mb-8 text-center">
        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${
          isAiSpeaking ? 'bg-indigo-100 animate-pulse' :
          isUserTurn ? 'bg-green-100' :
          isProcessing ? 'bg-amber-100 animate-pulse' :
          'bg-gray-100'
        }`}>
          <span className="text-3xl">
            {isAiSpeaking ? '🎙️' : isUserTurn ? '👂' : isProcessing ? '⏳' : '🤖'}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          {state === 'connecting' && 'Connecting...'}
          {isAiSpeaking && 'AI is speaking...'}
          {isUserTurn && 'Your turn — speak your answer'}
          {isProcessing && 'Processing your answer...'}
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
      <div className="max-w-2xl w-full bg-white rounded-xl border border-gray-200 p-4 mb-6 h-40 overflow-y-auto">
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
        
        {/* Barge-in button — always visible when AI speaking */}
        {isAiSpeaking && (
          <button
            onClick={bargeIn}
            className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            ✋ Interrupt
          </button>
        )}

        {/* Done Answering — visible when it's user's turn */}
        {isUserTurn && (
          <button
            onClick={submitAnswer}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-medium text-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            ✓ Done Answering
          </button>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="px-8 py-4 bg-gray-100 text-gray-400 rounded-xl font-medium text-lg">
            Processing...
          </div>
        )}
      </div>

      {/* Mic indicator */}
      {isUserTurn && (
        <p className="mt-4 text-xs text-green-600 animate-pulse">
          🔴 Recording — speak now
        </p>
      )}
    </div>
  );
}
