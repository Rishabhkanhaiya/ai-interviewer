"""
Phase 12 — Audio Analytics Engine

Computes WPM, pause events, filler word counts, and confidence averages
from Saaras word-level timestamp data.

All analytics stored per-answer in session_answers table.
"""

from typing import List
from models.schemas import TranscriptWord, PauseEvent, AnswerAnalytics
from services.sarvam_stt import FILLER_WORDS


# ── WPM Calculation ──────────────────────────────────────────────────────────

def calculate_wpm(word_timestamps: List[TranscriptWord]) -> float:
    """
    Words per minute from word-level timestamps.

    Formula: total_words ÷ (last_word_end_ms - first_word_start_ms) × 60,000

    Returns 0.0 if fewer than 2 words (insufficient data).
    """
    if len(word_timestamps) < 2:
        return 0.0

    total_words = len(word_timestamps)
    duration_ms = word_timestamps[-1].end_ms - word_timestamps[0].start_ms

    if duration_ms <= 0:
        return 0.0

    return round((total_words / duration_ms) * 60_000, 1)


# ── Pause Detection ──────────────────────────────────────────────────────────

def detect_pauses(
    word_timestamps: List[TranscriptWord],
    threshold_ms: int = 2500,
) -> List[PauseEvent]:
    """
    Detect pauses between consecutive words exceeding the threshold.

    A pause is the gap between word[i].end_ms and word[i+1].start_ms.
    Default threshold: 2500ms (2.5 seconds) — spec §7.1 specifies > 2.5s.

    Returns a list of PauseEvent objects.
    """
    pauses: List[PauseEvent] = []

    for i in range(len(word_timestamps) - 1):
        current_word_end = word_timestamps[i].end_ms
        next_word_start = word_timestamps[i + 1].start_ms
        gap_ms = next_word_start - current_word_end

        if gap_ms > threshold_ms:
            pauses.append(PauseEvent(
                start_ms=current_word_end,
                duration_ms=gap_ms,
            ))

    return pauses


# ── Filler Word Detection ────────────────────────────────────────────────────

def count_fillers(words: List[TranscriptWord]) -> dict[str, int]:
    """
    Count filler words from a list of transcript words.

    Returns a dict like: {"basically": 3, "um": 2, "toh": 1}
    Only words where is_filler=True are counted.
    """
    filler_counts: dict[str, int] = {}

    for word in words:
        if word.is_filler:
            key = word.text.lower().strip(".,!?")
            filler_counts[key] = filler_counts.get(key, 0) + 1

    return filler_counts


# ── Confidence Average ───────────────────────────────────────────────────────

def calculate_confidence_avg(words: List[TranscriptWord]) -> float:
    """
    Mean confidence score across all words.

    Words with confidence < 0.6 indicate uncertain/guessed answers.
    Returns 0.0 if no words provided.
    """
    if not words:
        return 0.0
    return round(sum(w.confidence for w in words) / len(words), 3)


# ── Language Mix ─────────────────────────────────────────────────────────────

def calculate_language_mix(words: List[TranscriptWord]) -> dict[str, float]:
    """
    Calculate the proportion of English vs Hindi/Hinglish words.

    Returns: {"english": 0.72, "hindi": 0.28}
    Based on the language tag from Saaras per-word detection.
    """
    if not words:
        return {"english": 1.0, "hindi": 0.0}

    total = len(words)
    hindi_count = sum(1 for w in words if w.language in ("hi", "hi-IN"))
    english_count = total - hindi_count

    return {
        "english": round(english_count / total, 2),
        "hindi": round(hindi_count / total, 2),
    }


# ── Full Answer Analytics ────────────────────────────────────────────────────

def analyze_answer(words: List[TranscriptWord]) -> AnswerAnalytics:
    """
    Compute all analytics for a single answer.
    This is the main entry point called after each answer is finalized.
    """
    return AnswerAnalytics(
        wpm=calculate_wpm(words),
        filler_words=count_fillers(words),
        pauses=detect_pauses(words),
        confidence_avg=calculate_confidence_avg(words),
        language_mix=calculate_language_mix(words),
    )


# ── Communication Score (0-25) ───────────────────────────────────────────────

def calculate_communication_score(
    wpm: float,
    filler_count: int,
    total_words: int,
    confidence_avg: float,
) -> int:
    """
    Communication score out of 25 (spec §6.3 A-08).

    Components:
    - WPM in ideal range 120-150: up to 10 pts
    - Filler rate (fillers/total_words): up to 8 pts
    - Confidence average: up to 7 pts
    """
    score = 0

    # WPM score (0-10)
    if 120 <= wpm <= 150:
        score += 10
    elif 100 <= wpm < 120 or 150 < wpm <= 170:
        score += 7
    elif 80 <= wpm < 100 or 170 < wpm <= 200:
        score += 4
    else:
        score += 1

    # Filler rate score (0-8)
    if total_words > 0:
        filler_rate = filler_count / total_words
        if filler_rate < 0.02:
            score += 8
        elif filler_rate < 0.05:
            score += 6
        elif filler_rate < 0.10:
            score += 4
        elif filler_rate < 0.15:
            score += 2
        # else 0

    # Confidence score (0-7)
    if confidence_avg >= 0.90:
        score += 7
    elif confidence_avg >= 0.80:
        score += 5
    elif confidence_avg >= 0.70:
        score += 3
    elif confidence_avg >= 0.60:
        score += 1

    return min(score, 25)


# ── Confidence/Pause Score (0-25) ─────────────────────────────────────────────

def calculate_confidence_score(
    pause_count: int,
    answer_duration_seconds: float,
    low_confidence_word_count: int,
    total_words: int,
) -> int:
    """
    Confidence score out of 25 (spec §6.3 A-08).

    Components:
    - Long pause frequency: up to 13 pts
    - Low-confidence word ratio: up to 12 pts
    """
    score = 0

    # Pause score (0-13)
    if answer_duration_seconds > 0:
        pauses_per_minute = (pause_count / answer_duration_seconds) * 60
        if pauses_per_minute < 1:
            score += 13
        elif pauses_per_minute < 2:
            score += 10
        elif pauses_per_minute < 4:
            score += 7
        elif pauses_per_minute < 6:
            score += 4
        else:
            score += 1

    # Low-confidence word ratio (0-12)
    if total_words > 0:
        lc_ratio = low_confidence_word_count / total_words
        if lc_ratio < 0.05:
            score += 12
        elif lc_ratio < 0.10:
            score += 9
        elif lc_ratio < 0.20:
            score += 6
        elif lc_ratio < 0.30:
            score += 3

    return min(score, 25)
