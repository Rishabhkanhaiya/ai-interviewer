"""
Test both Sarvam STT and TTS APIs to confirm exact message formats.
Run: python test_sarvam.py
"""
import asyncio
import json
import websockets

API_KEY = "sk_gdyu0kub_QC4rKC0vGmMCI9whaRmLSLyt"

async def test_stt():
    """Test STT API - what does a successful connect look like?"""
    print("\n=== STT TEST ===")
    try:
        ws_url = "wss://api.sarvam.ai/speech-to-text-realtime/ws?language_code=hi-en"
        ws = await websockets.connect(
            ws_url,
            extra_headers={"api-subscription-key": API_KEY}
        )
        print("STT Connected!")
        # Try sending a silence audio frame (valid 16kHz mono int16 PCM)
        import struct
        # 100ms of silence = 1600 samples of 16-bit zeros
        silence = struct.pack('<1600h', *([0]*1600))
        await ws.send(silence)
        
        # Wait for any response
        try:
            resp = await asyncio.wait_for(ws.recv(), timeout=3.0)
            print("STT Response:", type(resp), repr(resp)[:200])
        except asyncio.TimeoutError:
            print("STT: No response in 3s (silence sends no transcript, this is expected)")
        
        await ws.close()
    except Exception as e:
        print("STT Error:", repr(e))


async def test_tts():
    """Test TTS API - confirm audio_output message structure."""
    print("\n=== TTS TEST ===")
    try:
        ws_url = "wss://api.sarvam.ai/text-to-speech/ws?model=bulbul:v3&send_completion_event=true"
        ws = await websockets.connect(
            ws_url,
            extra_headers={"api-subscription-key": API_KEY}
        )
        print("TTS Connected!")
        
        # Config
        await ws.send(json.dumps({
            "type": "config",
            "data": {
                "target_language_code": "en-IN",
                "speaker": "aditya",
                "pace": 1.0,
                "speech_sample_rate": 22050,
                "output_audio_codec": "mp3"
            }
        }))
        
        # Text
        await ws.send(json.dumps({
            "type": "text",
            "data": {"text": "Hello! Tell me about yourself."}
        }))
        
        # Flush
        await ws.send(json.dumps({"type": "flush"}))
        
        audio_count = 0
        first_audio_printed = False
        while True:
            try:
                msg = await asyncio.wait_for(ws.recv(), timeout=8.0)
                if isinstance(msg, bytes):
                    audio_count += 1
                    print(f"TTS Binary chunk: {len(msg)} bytes")
                elif isinstance(msg, str):
                    data = json.loads(msg)
                    t = data.get("type")
                    if not first_audio_printed and t == "audio":
                        print(f"FULL AUDIO MSG: {json.dumps(data)[:500]}")
                        first_audio_printed = True
                    elif t == "event":
                        print(f"FULL EVENT MSG: {json.dumps(data)[:500]}")
                        break
                    elif t == "error":
                        print(f"ERROR MSG: {json.dumps(data)}")
                        break
                    else:
                        print(f"TTS JSON type={t}")
                        audio_count += 1
            except asyncio.TimeoutError:
                print(f"TTS: Timeout after {audio_count} chunks")
                break
        
        await ws.close()
    except Exception as e:
        print("TTS Error:", repr(e))


async def main():
    await test_stt()
    await test_tts()


asyncio.run(main())
