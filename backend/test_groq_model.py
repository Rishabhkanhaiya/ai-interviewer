import asyncio
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

async def test_groq():
    print("Testing Groq API with model: llama-3.1-8b-instant")
    
    api_key = os.environ.get("GROK_API_KEY") or os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("Error: GROK_API_KEY is not set in .env")
        return
        
    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1",
    )
    
    try:
        response = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say 'Model is working!'"}
            ],
            temperature=0,
            max_tokens=20
        )
        print("Success!")
        print("Response:", response.choices[0].message.content)
    except Exception as e:
        print("Failed!")
        print("Error:", str(e))

if __name__ == "__main__":
    asyncio.run(test_groq())
