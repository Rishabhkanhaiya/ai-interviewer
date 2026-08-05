import httpx
import base64
from typing import Optional
from dataclasses import dataclass
from config import get_settings

settings = get_settings()
SARVAM_API_KEY = settings.sarvam_api_key
SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text"


@dataclass
class STTResult:
    transcript: str
    language_code: str
    word_timestamps: list[dict]
    confidence: float
    filler_words: list[str]
    wpm: float


FILLER_WORDS = {
    "um", "uh", "like", "basically", "actually", "literally",
    "you know", "sort of", "kind of", "i mean", "right",
    # Hinglish fillers
    "matlab", "toh", "aur", "woh", "bas", "ek dum", "matlab ki",
    "basically matlab", "you see", "so basically"
}


async def speech_to_text(
    audio_base64: str,
    audio_format: str = "audio/webm;codecs=opus"
) -> Optional[STTResult]:
    """
    Transcribe user's recorded audio via Sarvam REST STT.
    """
    audio_bytes = base64.b64decode(audio_base64)
    
    ext_map = {
        "audio/webm": "webm",
        "audio/webm;codecs=opus": "webm",
        "audio/ogg": "ogg",
        "audio/ogg;codecs=opus": "ogg",
        "audio/wav": "wav",
        "audio/mp4": "m4a",
        "audio/mp3": "mp3",
    }
    # Safely extract mime from format string
    mime = audio_format.split(";")[0] if audio_format else "audio/webm"
    ext = ext_map.get(mime, "webm")
    filename = f"answer.{ext}"
    
    async with httpx.AsyncClient(timeout=45.0) as client:
        try:
            response = await client.post(
                SARVAM_STT_URL,
                headers={"api-subscription-key": SARVAM_API_KEY},
                files={
                    "file": (filename, audio_bytes, mime)
                },
                data={
                    "language_code": "unknown",      # Auto-detect English/Hindi/Hinglish
                    "model": "saaras:v3",
                    "with_timestamps": "true",
                    "with_diarization": "false",
                }
            )
            response.raise_for_status()
            data = response.json()
            
        except httpx.HTTPStatusError as e:
            print(f"[STT] Sarvam API error {e.response.status_code}: {e.response.text}")
            return None
        except Exception as e:
            print(f"[STT] Unexpected error: {e}")
            return None
    
    transcript = data.get("transcript", "").strip()
    language_code = data.get("language_code", "hi-IN")
    word_timestamps = data.get("word_timestamps", [])
    
    wpm = _calculate_wpm(word_timestamps)
    fillers = _detect_fillers(transcript)
    confidence = _calculate_confidence(word_timestamps)
    
    return STTResult(
        transcript=transcript,
        language_code=language_code,
        word_timestamps=word_timestamps,
        confidence=confidence,
        filler_words=fillers,
        wpm=wpm,
    )


def _calculate_wpm(word_timestamps: list[dict]) -> float:
    if len(word_timestamps) < 2:
        return 0.0
    
    first_word_start = word_timestamps[0].get("start", 0)
    last_word_end = word_timestamps[-1].get("end", 0)
    duration_minutes = (last_word_end - first_word_start) / 60.0
    
    if duration_minutes <= 0:
        return 0.0
    
    return round(len(word_timestamps) / duration_minutes, 1)


def _detect_fillers(transcript: str) -> list[str]:
    lower = transcript.lower()
    found = []
    for filler in FILLER_WORDS:
        if filler in lower:
            count = lower.count(filler)
            found.extend([filler] * count)
    return found


def _calculate_confidence(word_timestamps: list[dict]) -> float:
    scores = [w.get("confidence", 1.0) for w in word_timestamps if "confidence" in w]
    if not scores:
        return 1.0
    return round(sum(scores) / len(scores), 3)
