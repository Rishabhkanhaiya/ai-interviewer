import asyncio
import base64
import sys
sys.path.insert(0, '.')
from services.sarvam_tts import text_to_speech_sentence

async def test():
    print("Requesting TTS...")
    audio_b64 = await text_to_speech_sentence(
        "Good morning! Tell me about yourself.",
        persona="raj_technical"
    )
    if audio_b64:
        # Save to file and play manually
        with open("test_output.wav", "wb") as f:
            f.write(base64.b64decode(audio_b64))
        print("SUCCESS — open test_output.wav and listen")
    else:
        print("FAILED — check API key and credits")

if __name__ == "__main__":
    asyncio.run(test())
