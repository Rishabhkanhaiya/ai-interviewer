import asyncio
from services.sarvam_tts import text_to_speech_full
import base64

async def test_tts():
    print("Testing Priya HR voice...")
    audio_buffers = await text_to_speech_full(
        text="Hello! I'm your interviewer today. Please tell me about yourself.",
        persona="priya_hr"
    )
    if audio_buffers:
        print(f"SUCCESS! Received {len(audio_buffers)} audio chunks.")
        for i, chunk in enumerate(audio_buffers):
            print(f"Chunk {i+1} size: {len(chunk)} bytes")
    else:
        print("FAILED! No audio received.")

if __name__ == "__main__":
    asyncio.run(test_tts())
