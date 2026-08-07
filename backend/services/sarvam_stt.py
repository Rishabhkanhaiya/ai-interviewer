import httpx
import base64
import asyncio
import subprocess
import tempfile
import json
import os
from dataclasses import dataclass
from typing import Optional
from config import get_settings

FFMPEG_PATH = r"C:\Users\Rishabh_Joshi\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffmpeg.exe"
FFPROBE_PATH = r"C:\Users\Rishabh_Joshi\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffprobe.exe"

settings = get_settings()
SARVAM_API_KEY = settings.sarvam_api_key
SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text"
CHUNK_DURATION_SECONDS = 25  # Stay safely under Sarvam's 30s limit

FILLER_WORDS = {
    "um", "uh", "like", "basically", "actually", "literally",
    "you know", "sort of", "kind of", "i mean", "right",
    "matlab", "toh", "aur", "woh", "bas", "ek dum",
    "so basically", "you see"
}


@dataclass
class STTResult:
    transcript: str
    language_code: str
    word_timestamps: list
    confidence: float
    filler_words: list
    wpm: float


async def convert_to_wav(audio_bytes: bytes, input_format: str) -> bytes:
    """Convert any audio format to WAV 16kHz mono using ffmpeg."""
    ext_map = {
        "audio/webm": "webm", "audio/webm;codecs=opus": "webm",
        "audio/ogg": "ogg", "audio/ogg;codecs=opus": "ogg",
        "audio/mp4": "mp4", "audio/wav": "wav",
    }
    input_ext = ext_map.get(input_format.split(";")[0], "webm")

    with tempfile.NamedTemporaryFile(suffix=f".{input_ext}", delete=False) as f:
        f.write(audio_bytes)
        input_path = f.name

    output_path = input_path.replace(f".{input_ext}", ".wav")

    try:
        result = subprocess.run([
            FFMPEG_PATH, "-y", "-i", input_path,
            "-ar", "16000", "-ac", "1",
            "-acodec", "pcm_s16le", output_path
        ], capture_output=True, timeout=30)

        if result.returncode != 0:
            print(f"[STT] ffmpeg failed: {result.stderr.decode()}")
            return audio_bytes

        with open(output_path, "rb") as f:
            return f.read()
    finally:
        os.unlink(input_path)
        if os.path.exists(output_path):
            os.unlink(output_path)


def get_audio_duration(wav_bytes: bytes) -> float:
    """Get duration of WAV audio in seconds using ffprobe."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(wav_bytes)
        path = f.name

    try:
        result = subprocess.run([
            FFPROBE_PATH, "-v", "quiet",
            "-print_format", "json",
            "-show_format", path
        ], capture_output=True, timeout=10)

        info = json.loads(result.stdout)
        return float(info["format"]["duration"])
    except Exception as e:
        print(f"[STT] Could not get duration: {e}")
        return 0.0
    finally:
        os.unlink(path)


async def split_into_chunks(wav_bytes: bytes) -> list[bytes]:
    """
    Split WAV audio into CHUNK_DURATION_SECONDS chunks.
    Each chunk is a valid WAV file Sarvam can process.
    """
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(wav_bytes)
        input_path = f.name

    duration = get_audio_duration(wav_bytes)
    print(f"[STT] Audio duration: {duration:.1f}s — splitting into {CHUNK_DURATION_SECONDS}s chunks")

    chunks = []
    start = 0.0
    chunk_index = 0

    try:
        while start < duration:
            chunk_path = f"{input_path}_chunk_{chunk_index}.wav"

            subprocess.run([
                FFMPEG_PATH, "-y",
                "-i", input_path,
                "-ss", str(start),
                "-t", str(CHUNK_DURATION_SECONDS),
                "-ar", "16000", "-ac", "1",
                "-acodec", "pcm_s16le",
                chunk_path
            ], capture_output=True, timeout=30)

            if os.path.exists(chunk_path):
                with open(chunk_path, "rb") as f:
                    chunk_data = f.read()
                if len(chunk_data) > 1000:  # Valid chunk
                    chunks.append(chunk_data)
                    print(f"[STT] Chunk {chunk_index}: {start:.1f}s-{start+CHUNK_DURATION_SECONDS:.1f}s ({len(chunk_data)} bytes)")
                os.unlink(chunk_path)

            start += CHUNK_DURATION_SECONDS
            chunk_index += 1

    finally:
        os.unlink(input_path)

    return chunks


async def transcribe_single_chunk(
    wav_bytes: bytes,
    client: httpx.AsyncClient,
    chunk_index: int
) -> str:
    """Transcribe a single WAV chunk via Sarvam REST STT."""
    try:
        response = await client.post(
            SARVAM_STT_URL,
            headers={"api-subscription-key": SARVAM_API_KEY},
            files={"file": ("chunk.wav", wav_bytes, "audio/wav")},
            data={
                "language_code": "unknown",
                "model": "saaras:v4",
                "with_timestamps": "true",
                "with_diarization": "false",
            }
        )
        response.raise_for_status()
        data = response.json()
        transcript = data.get("transcript", "").strip()
        safe_print_text = transcript[:60].encode('ascii', 'replace').decode('ascii')
        print(f"[STT] Chunk {chunk_index} transcript: '{safe_print_text}...'")
        return transcript

    except httpx.HTTPStatusError as e:
        print(f"[STT] Chunk {chunk_index} failed: {e.response.status_code} {e.response.text[:200]}")
        return ""
    except Exception as e:
        print(f"[STT] Chunk {chunk_index} error: {e}")
        return ""


async def speech_to_text(
    audio_base64: str,
    audio_format: str = "audio/webm;codecs=opus"
) -> Optional[STTResult]:
    """
    Transcribe audio of ANY length by chunking.
    No 30-second limit. Student can answer for as long as needed.
    """
    audio_bytes = base64.b64decode(audio_base64)
    print(f"[STT] Received {len(audio_bytes)} bytes ({audio_format})")

    if len(audio_bytes) < 500:
        print("[STT] Audio too small — likely empty recording")
        return None

    # Step 1: Convert to WAV
    wav_bytes = await convert_to_wav(audio_bytes, audio_format)
    duration = get_audio_duration(wav_bytes)
    print(f"[STT] WAV duration: {duration:.1f} seconds")

    # Step 2: Chunk if needed
    if duration <= 28:
        # Short enough for direct transcription
        chunks = [wav_bytes]
        print("[STT] Short audio — single transcription")
    else:
        # Long audio — split and transcribe each chunk
        chunks = await split_into_chunks(wav_bytes)
        print(f"[STT] Split into {len(chunks)} chunks")

    if not chunks:
        print("[STT] No valid chunks produced")
        return None

    # Step 3: Transcribe all chunks in parallel
    async with httpx.AsyncClient(timeout=30.0) as client:
        tasks = [
            transcribe_single_chunk(chunk, client, i)
            for i, chunk in enumerate(chunks)
        ]
        chunk_transcripts = await asyncio.gather(*tasks)

    # Step 4: Concatenate all transcripts
    full_transcript = " ".join(
        t for t in chunk_transcripts if t.strip()
    ).strip()

    safe_full_text = full_transcript[:100].encode('ascii', 'replace').decode('ascii')
    print(f"[STT] Full transcript ({len(full_transcript)} chars): '{safe_full_text}'")

    if not full_transcript:
        return None

    # Step 5: Calculate analytics from full transcript
    words = full_transcript.split()
    wpm = round((len(words) / duration) * 60, 1) if duration > 0 else 0
    fillers = _detect_fillers(full_transcript)
    confidence = 0.85  # Estimate — chunked transcription loses per-word scores

    return STTResult(
        transcript=full_transcript,
        language_code="hi-en",
        word_timestamps=[],  # Lost in chunking — acceptable trade-off
        confidence=confidence,
        filler_words=fillers,
        wpm=wpm,
    )


def _detect_fillers(transcript: str) -> list:
    lower = transcript.lower()
    found = []
    for filler in FILLER_WORDS:
        count = lower.count(filler)
        found.extend([filler] * count)
    return found
