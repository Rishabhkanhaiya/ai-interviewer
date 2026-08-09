'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

interface PresenceCheckProps {
  isActive: boolean;
  onPresenceChange?: (isPresent: boolean) => void;
  onSoftNudge?: () => void;
  onHardPause?: () => void;
}

export const PresenceCheck: React.FC<PresenceCheckProps> = ({
  isActive,
  onPresenceChange,
  onSoftNudge,
  onHardPause
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const workerRef = useRef<Worker | null>(null)
  const [hasFace, setHasFace] = useState(true)
  const absentTimeRef = useRef<number>(0)
  const lastUpdateRef = useRef<number>(Date.now())
  const hasTriggeredNudge = useRef<boolean>(false)
  const hasTriggeredPause = useRef<boolean>(false)

  // Initialize Worker and MediaStream
  useEffect(() => {
    if (!isActive) return;

    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.error("PresenceCheck: failed to get user media", e);
      }
    };

    const initWorker = () => {
      // In Next.js, workers can be loaded like this
      workerRef.current = new Worker(new URL('@/workers/presence.worker.ts', import.meta.url));
      workerRef.current.postMessage({ type: 'INIT' });

      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'RESULT') {
          const currentFace = e.data.hasFace;
          setHasFace(currentFace);
          if (onPresenceChange) onPresenceChange(currentFace);

          const now = Date.now();
          const delta = now - lastUpdateRef.current;
          lastUpdateRef.current = now;

          if (!currentFace) {
            absentTimeRef.current += delta;
            
            // Soft nudge at 8 seconds
            if (absentTimeRef.current >= 8000 && !hasTriggeredNudge.current) {
              hasTriggeredNudge.current = true;
              if (onSoftNudge) onSoftNudge();
            }
            // Hard pause at 20 seconds
            if (absentTimeRef.current >= 20000 && !hasTriggeredPause.current) {
              hasTriggeredPause.current = true;
              if (onHardPause) onHardPause();
            }
          } else {
            // Reset timers when face is found
            absentTimeRef.current = 0;
            hasTriggeredNudge.current = false;
            hasTriggeredPause.current = false;
          }
        }
      };
    };

    const processFrame = async () => {
      if (videoRef.current && videoRef.current.readyState === 4 && workerRef.current) {
        try {
          // Create ImageBitmap to send to worker
          const bitmap = await createImageBitmap(videoRef.current);
          workerRef.current.postMessage({ type: 'PROCESS_FRAME', imageData: bitmap }, [bitmap]);
        } catch (e) {
          // Ignored if createImageBitmap fails briefly
        }
      }
      animationFrameId = requestAnimationFrame(processFrame);
    };

    startCamera().then(() => {
      initWorker();
      processFrame();
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, onPresenceChange, onSoftNudge, onHardPause]);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 w-48 aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-slate-700 opacity-50 hover:opacity-100 transition-opacity z-50">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      {!hasFace && (
        <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
          <span className="text-white text-xs font-bold px-2 py-1 bg-red-600 rounded">Face not detected</span>
        </div>
      )}
    </div>
  )
}
