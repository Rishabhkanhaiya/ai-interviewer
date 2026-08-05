import asyncio
import base64
import sys
sys.path.insert(0, '.')
from services.sarvam_stt import speech_to_text

async def test():
    print("Testing STT with the generated TTS wav file...")
    try:
        with open("test_output.wav", "rb") as f:
            audio_bytes = f.read()
    except FileNotFoundError:
        print("Run test_tts.py first to generate test_output.wav")
        return
        
    audio_b64 = base64.b64encode(audio_bytes).decode()
    
    result = await speech_to_text(audio_b64, "audio/wav")
    if result:
        print(f"Transcript: {result.transcript}")
        print(f"WPM: {result.wpm}")
        print(f"Fillers: {result.filler_words}")
    else:
        print("FAILED — check audio format and API key")

if __name__ == "__main__":
    asyncio.run(test())
