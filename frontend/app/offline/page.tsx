'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="text-2xl font-semibold text-[#111827] mb-3">You&apos;re offline</h1>
        <p className="text-[#6B7280] mb-8 leading-relaxed">
          Looks like your internet connection dropped. InterviewAI needs a connection for the voice AI.
          Check your WiFi or mobile data and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#4F46E5] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#4338CA] transition-colors"
        >
          Try again
        </button>
        <p className="text-xs text-[#9CA3AF] mt-6">
          Your session data is saved locally — you won&apos;t lose any progress.
        </p>
      </div>
    </div>
  )
}
