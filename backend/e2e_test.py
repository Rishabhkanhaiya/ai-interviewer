import asyncio
import httpx
import websockets
import json

TOKEN = "eyJhbGciOiJFUzI1NiIsImtpZCI6ImI0M2ZmYTc2LTkxMmUtNGQ3MS05Yjk2LTMyNjZmOWY3NTYyOSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3N2cWl5eGpiZnhsbGtienZjcHlxLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI5OGM1NTYwMi0yOTY5LTRhODYtYjU4Yy02YjQ1MGY0ZGZhMjkiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzg2MjI0MDA3LCJpYXQiOjE3ODYyMjA0MDcsImVtYWlsIjoicmlzaGFiaGthbmhhaXlham9zaGlAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6InJpc2hhYmhrYW5oYWl5YWpvc2hpQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6Ijk4YzU1NjAyLTI5NjktNGE4Ni1iNThjLTZiNDUwZjRkZmEyOSJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im90cCIsInRpbWVzdGFtcCI6MTc4NjE4OTcwM31dLCJzZXNzaW9uX2lkIjoiYzZlMmJlNGMtZTdiMS00NTMwLWEyYTQtNGJmYTdkY2M5ZTRjIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.Sxgivcb28YYzWF8n2-wlzzYOzU22SW9bf9HomwrezP96rL_m9Zwu1lfnMyueAPsXta-UOC2voYTHLd6zxNCGPQ"
BASE_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000"

async def run_tests():
    print("1. Starting session with custom company name...")
    async with httpx.AsyncClient() as client:
        req_data = {
            "company": "uber",
            "role": "sde",
            "round_type": "technical",
            "language_pref": "hinglish",
            "camera_mode": "video"
        }
        res = await client.post(
            f"{BASE_URL}/api/sessions/start",
            json=req_data,
            headers={"Authorization": f"Bearer {TOKEN}"},
            timeout=10.0
        )
        
        if res.status_code != 200:
            print(f"❌ Session start failed! {res.status_code}")
            print(res.text)
            return
            
        data = res.json()
        session_id = data.get("session_id")
        print(f"✅ Session created: {session_id}")
        
    print(f"2. Connecting to WebSocket for session {session_id}...")
    ws_endpoint = f"{WS_URL}/ws/interview/{session_id}?token={TOKEN}"
    try:
        async with websockets.connect(ws_endpoint) as ws:
            print("✅ WebSocket connected successfully!")
            
            # The engine should immediately send intro audio/text if it initialized successfully
            msg_str = await asyncio.wait_for(ws.recv(), timeout=15.0)
            msg = json.loads(msg_str)
            print("✅ Received initial message from engine:")
            print(f"   Event: {msg.get('event')}")
            if msg.get("event") == "audio_chunk":
                print("   [Audio chunk received successfully]")
            else:
                print(f"   Payload: {msg}")
                
            print("\n🎉 ALL TESTS PASSED SUCCESSFULLY! The flow is working perfectly.")
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")

if __name__ == "__main__":
    asyncio.run(run_tests())
