"""
Test Sarvam REST STT API with real audio.
"""
import asyncio
import sys, os, struct, math
sys.path.insert(0, os.path.dirname(__file__))

def generate_sine_wave(freq=440, duration_s=2, sample_rate=16000):
    """Generate PCM sine wave audio."""
    n_samples = int(sample_rate * duration_s)
    samples = []
    for i in range(n_samples):
        val = int(32767 * 0.3 * math.sin(2 * math.pi * freq * i / sample_rate))
        samples.append(struct.pack('<h', val))
    return b''.join(samples)

def pcm_to_wav(pcm_data, sample_rate=16000, channels=1, bits=16):
    """Wrap raw PCM in WAV header."""
    data_size = len(pcm_data)
    header = struct.pack('<4sI4s4sIHHIIHH4sI',
        b'RIFF', 36 + data_size, b'WAVE',
        b'fmt ', 16, 1, channels, sample_rate,
        sample_rate * channels * bits // 8,
        channels * bits // 8, bits,
        b'data', data_size
    )
    return header + pcm_data

async def test_rest_stt():
    import httpx
    from config import get_settings
    settings = get_settings()
    
    print("Testing Sarvam REST STT API...")
    print(f"API key: {settings.sarvam_api_key[:8]}...")
    
    # Generate 2 seconds of audio (sine wave)
    pcm = generate_sine_wave(440, 2)
    wav_data = pcm_to_wav(pcm)
    print(f"  WAV size: {len(wav_data)} bytes")
    
    # Try Sarvam REST STT
    url = "https://api.sarvam.ai/speech-to-text"
    headers = {"api-subscription-key": settings.sarvam_api_key}
    
    files = {"file": ("audio.wav", wav_data, "audio/wav")}
    data = {"model": "saaras:v2", "language_code": "auto"}
    
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, headers=headers, files=files, data=data)
        print(f"  Status: {resp.status_code}")
        print(f"  Response: {resp.text[:500]}")
        
        if resp.status_code == 200:
            print("Sarvam REST STT: WORKING!")
        elif resp.status_code == 402:
            print("Sarvam REST STT: QUOTA EXCEEDED (same issue)")
        else:
            print(f"Sarvam REST STT: ERROR {resp.status_code}")

asyncio.run(test_rest_stt())
