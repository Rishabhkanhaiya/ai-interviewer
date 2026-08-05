import asyncio
from sarvamai import AsyncSarvamAI

async def tts_stream():
    client = AsyncSarvamAI(api_subscription_key="x")
    try:
        async with client.text_to_speech_streaming.connect(model="bulbul:v3") as ws:
            print(dir(ws))
    except Exception as e:
        print("Error connecting but maybe ws is available?")

asyncio.run(tts_stream())
