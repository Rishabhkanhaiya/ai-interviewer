import httpx
import base64
import asyncio
from typing import Optional
import re
from config import get_settings

settings = get_settings()
SARVAM_API_KEY = settings.sarvam_api_key
SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech"

# Voice personas — map to Sarvam voice IDs
VOICE_PERSONAS = {
    "raj_technical": {
        "speaker": "aditya",          # Professional male
        "display_name": "Raj",
        "role_label": "Senior Engineer",
        "target_language_code": "hi-IN",
        "pitch": -0.1,
        "pace": 1.0,
        "loudness": 1.5,
    },
    "priya_hr": {
        "speaker": "priya",           # Warm female
        "display_name": "Priya",
        "role_label": "HR Manager",
        "target_language_code": "hi-IN",
        "pitch": 0.1,
        "pace": 0.95,
        "loudness": 1.5,
    },
    "arjun_startup": {
        "speaker": "rahul",            # Direct, energetic male
        "display_name": "Arjun",
        "role_label": "Startup Founder",
        "target_language_code": "hi-IN",
        "pitch": 0.0,
        "pace": 1.05,
        "loudness": 1.6,
    },
}

def get_persona_for_round(round_type: str, company: str) -> str:
    """Determine which TTS persona to use based on company/round."""
    if round_type == "hr":
        return "priya_hr"
    elif company in ["startup", "startup_react", "faang"]:
        return "arjun_startup"
    else:
        return "raj_technical"

def split_into_sentences(text: str) -> list[str]:
    """
    Split text into natural sentences for sentence-boundary TTS.
    Each sentence becomes one audio buffer.
    """
    # Split on sentence-ending punctuation, keep delimiter
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    # Filter empty strings, ensure each is reasonable length
    return [s.strip() for s in sentences if len(s.strip()) > 3]


async def text_to_speech_sentence(
    text: str,
    persona: str = "raj_technical",
    client: Optional[httpx.AsyncClient] = None
) -> Optional[str]:
    """
    Convert a single sentence to speech via Sarvam REST TTS.
    
    Returns: Base64-encoded WAV string, or None on failure.
    
    Uses REST API (not WebSocket streaming) for reliability.
    Each sentence is a complete, decodable audio file.
    """
    voice_config = VOICE_PERSONAS.get(persona, VOICE_PERSONAS["raj_technical"])
    
    payload = {
        "inputs": [text],
        "target_language_code": "hi-IN", # Force hi-IN for all
        "speaker": voice_config["speaker"],
        "pace": voice_config.get("pace", 1.0),
        "speech_sample_rate": 8000,
        "enable_preprocessing": True,
        "model": "bulbul:v3"
    }
    
    headers = {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json"
    }
    
    should_close = False
    if client is None:
        client = httpx.AsyncClient(timeout=15.0)
        should_close = True
    
    try:
        response = await client.post(
            SARVAM_TTS_URL,
            json=payload,
            headers=headers
        )
        response.raise_for_status()
        
        data = response.json()
        # Sarvam returns: {"audios": ["base64_wav_string"]}
        audio_base64 = data["audios"][0]
        return audio_base64
        
    except httpx.HTTPStatusError as e:
        print(f"[TTS] Sarvam API error {e.response.status_code}: {e.response.text}")
        return None
    except Exception as e:
        print(f"[TTS] Unexpected error: {e}")
        return None
    finally:
        if should_close:
            await client.aclose()


async def text_to_speech_full(
    text: str,
    persona: str = "raj_technical"
) -> list[str]:
    """
    Convert full text (multiple sentences) to speech.
    
    Returns list of base64 WAV strings — one per sentence.
    Frontend plays them sequentially via AudioQueueManager.
    """
    sentences = split_into_sentences(text)
    
    if not sentences:
        # Fallback if no punctuation
        sentences = [text]
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Request all sentences in parallel
        tasks = [
            text_to_speech_sentence(sentence, persona, client)
            for sentence in sentences
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Filter out failures, return successful audio
    audio_buffers = []
    for i, result in enumerate(results):
        if isinstance(result, str):
            audio_buffers.append(result)
        else:
            print(f"[TTS] Sentence {i} failed: {result}")
    
    return audio_buffers
