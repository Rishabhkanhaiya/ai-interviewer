/**
 * Phase 07 — AudioWorklet Processor
 *
 * Runs in a dedicated audio rendering thread (not the main thread).
 * Captures microphone input at 16kHz, converts Float32 → Int16 PCM,
 * and posts binary chunks to the main thread for WebSocket transmission.
 *
 * File must be served from the /public directory as a static file.
 * Load via: new AudioWorkletNode(context, 'audio-processor')
 */

class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this._buffer = []
    this._bufferSize = 1600 // 100ms at 16kHz = 1600 samples
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || !input[0]) return true

    const channelData = input[0] // Mono channel (left or only)

    // Accumulate samples
    for (let i = 0; i < channelData.length; i++) {
      this._buffer.push(channelData[i])
    }

    // When we have enough samples, convert and post
    while (this._buffer.length >= this._bufferSize) {
      const chunk = this._buffer.splice(0, this._bufferSize)

      // Convert Float32 [-1.0, 1.0] → Int16 [-32768, 32767]
      const int16Array = new Int16Array(chunk.length)
      for (let i = 0; i < chunk.length; i++) {
        const s = Math.max(-1, Math.min(1, chunk[i]))
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
      }

      // Post binary buffer to main thread (transferable for zero-copy)
      this.port.postMessage(
        { type: 'audio-chunk', buffer: int16Array.buffer },
        [int16Array.buffer]
      )
    }

    return true // Keep processor alive
  }
}

registerProcessor('audio-processor', AudioProcessor)
