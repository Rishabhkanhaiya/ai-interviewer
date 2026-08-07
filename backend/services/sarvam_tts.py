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
        "speaker": "ratan",             # Sharp articulation male
        "display_name": "Ratan",
        "role_label": "Senior Engineer",
        "target_language_code": "en-IN",
        "pace": 0.80,                   # Slower pace
    },
    "priya_hr": {
        "speaker": "priya",             # Warm female
        "display_name": "Priya",
        "role_label": "HR Manager",
        "target_language_code": "en-IN",
        "pace": 0.80,
    },
    "arjun_startup": {
        "speaker": "ratan",             # Sharp articulation male
        "display_name": "Arjun",
        "role_label": "Startup Founder",
        "target_language_code": "en-IN",
        "pace": 0.80,
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
    client: Optional[httpx.AsyncClient] = None,
    pace_override: Optional[float] = None,
) -> Optional[str]:
    """
    Convert a single sentence to speech using Sarvam REST API.
    Returns base64 WAV string or None on failure.
    """
    should_close = False
    if client is None:
        client = httpx.AsyncClient(timeout=15.0)
        should_close = True
        
    voice_config = VOICE_PERSONAS.get(persona, VOICE_PERSONAS["raj_technical"])
        
    payload = {
        "inputs": [text],
        "target_language_code": voice_config["target_language_code"],
        "speaker": voice_config["speaker"],
        "pace": pace_override if pace_override is not None else voice_config.get("pace", 0.82),
        "speech_sample_rate": 22050,
        "enable_preprocessing": True,
        "model": "bulbul:v3"
    }
    
    headers = {
        "Content-Type": "application/json",
        "api-subscription-key": SARVAM_API_KEY
    }
    
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
    persona: str = "raj_technical",
    pace_override: Optional[float] = None,
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
    
    audio_buffers = []
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Process sequentially to prevent API throttling
        for i, sentence in enumerate(sentences):
            result = await text_to_speech_sentence(sentence, persona, client, pace_override=pace_override)
            if isinstance(result, str):
                audio_buffers.append(result)
            else:
                print(f"[TTS] Sentence {i+1} failed: {result}")
            
            # Small delay between requests to be safe with rate limits
            if i < len(sentences) - 1:
                await asyncio.sleep(0.1)
                
    return audio_buffers
