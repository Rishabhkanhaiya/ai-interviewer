"""
Quick test: does Sarvam STT WebSocket accept our connection?
"""
import asyncio
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

async def test_stt_connect():
    from services.sarvam_stt import SaarasSTTSession
    
    print("Testing STT connection with language=auto...")
    try:
        s = SaarasSTTSession(language_pref="hinglish")
        await s.connect()
        print("  Connected OK!")
        # Send 0.1s of silence (16kHz 16-bit mono = 16000*2*0.1 = 3200 bytes)
        silence = bytes(3200)
        await s.send_audio(silence)
        print("  Sent silent audio chunk (3200 bytes)")
        # Wait briefly for any events
        try:
            msg = await asyncio.wait_for(s._ws.recv(), timeout=2.0)
            print(f"  Received: {msg[:200]}")
        except asyncio.TimeoutError:
            print("  No events in 2s (expected for silence)")
        await s.close()
        print("  Closed OK!")
        print("STT: PASS")
    except Exception as e:
        print(f"  FAIL: {type(e).__name__}: {e}")

asyncio.run(test_stt_connect())
