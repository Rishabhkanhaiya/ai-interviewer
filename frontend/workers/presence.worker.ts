import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

let faceDetector: FaceDetector | null = null;
let isInitializing = false;
let lastProcessTime = 0;

async function initDetector() {
  if (faceDetector || isInitializing) return;
  isInitializing = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
        delegate: "GPU"
      },
      runningMode: "IMAGE"
    });
    postMessage({ type: 'INIT_SUCCESS' });
  } catch (error) {
    console.error('Error initializing FaceDetector in worker:', error);
    postMessage({ type: 'INIT_ERROR', error: String(error) });
  } finally {
    isInitializing = false;
  }
}

self.onmessage = async (e) => {
  if (e.data.type === 'INIT') {
    await initDetector();
  } else if (e.data.type === 'PROCESS_FRAME') {
    if (!faceDetector) return;
    
    // Throttle processing to max 2 fps (500ms)
    const now = performance.now();
    if (now - lastProcessTime < 500) return;
    lastProcessTime = now;

    try {
      const imageData = e.data.imageData;
      // We process ImageBitmap directly which is passed from the main thread
      const detections = faceDetector.detect(imageData);
      
      const hasFace = detections.detections.length > 0;
      postMessage({ type: 'RESULT', hasFace, timestamp: Date.now() });
      
    } catch (error) {
      console.error("Worker processing error:", error);
    }
  }
};
