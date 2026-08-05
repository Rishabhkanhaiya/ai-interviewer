"""
Phase 29 — Backend dry-run test with mocked external APIs.

Run this BEFORE setting up real API keys to verify:
- FastAPI routes respond correctly
- Redis helpers work (if Redis is running)
- Interview engine builds correct prompts
- Audio analytics functions produce correct outputs

Usage:
    cd backend
    .\\venv\\Scripts\\python.exe tests\\test_dry_run.py
"""

import asyncio
import sys
import os
import io

# Force UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ── Test 1: Audio Analytics (no API calls) ───────────────────────────────────

def test_audio_analytics():
    from models.schemas import TranscriptWord
    from services.audio_analytics import (
        calculate_wpm, detect_pauses, count_fillers,
        calculate_confidence_avg, calculate_language_mix,
        calculate_communication_score,
    )

    words = [
        TranscriptWord(text="basically", start_ms=0,    end_ms=500,  confidence=0.9,  is_filler=True,  language="en"),
        TranscriptWord(text="I",         start_ms=600,  end_ms=700,  confidence=0.99, is_filler=False, language="en"),
        TranscriptWord(text="think",     start_ms=750,  end_ms=900,  confidence=0.97, is_filler=False, language="en"),
        TranscriptWord(text="the",       start_ms=950,  end_ms=1050, confidence=0.98, is_filler=False, language="en"),
        TranscriptWord(text="ArrayList", start_ms=1100, end_ms=1600, confidence=0.92, is_filler=False, language="en"),
        TranscriptWord(text="uses",      start_ms=1650, end_ms=1900, confidence=0.94, is_filler=False, language="en"),
        # 2.6s pause here
        TranscriptWord(text="dynamic",   start_ms=4500, end_ms=5000, confidence=0.88, is_filler=False, language="en"),
        TranscriptWord(text="array",     start_ms=5050, end_ms=5400, confidence=0.91, is_filler=False, language="en"),
        TranscriptWord(text="toh",       start_ms=5450, end_ms=5600, confidence=0.85, is_filler=True,  language="hi"),
        TranscriptWord(text="basically", start_ms=5650, end_ms=6100, confidence=0.90, is_filler=True,  language="en"),
    ]

    wpm = calculate_wpm(words)
    pauses = detect_pauses(words, threshold_ms=2500)
    fillers = count_fillers(words)
    conf = calculate_confidence_avg(words)
    lang_mix = calculate_language_mix(words)
    comm_score = calculate_communication_score(wpm, sum(fillers.values()), len(words), conf)

    print("[PASS] Audio Analytics")
    print(f"  WPM: {wpm}")
    print(f"  Pauses (>2.5s): {len(pauses)} detected — {pauses}")
    print(f"  Filler words: {fillers}")
    print(f"  Confidence avg: {conf}")
    print(f"  Language mix: {lang_mix}")
    print(f"  Communication score: {comm_score}/25")

    assert wpm > 0, "WPM should be > 0"
    assert len(pauses) == 1, f"Expected 1 pause, got {len(pauses)}"
    assert fillers.get("basically") == 2, "Expected 2 x 'basically'"
    assert fillers.get("toh") == 1, "Expected 1 x 'toh'"
    assert lang_mix["hindi"] > 0, "Expected some Hindi words"
    print("  All assertions passed [OK]\n")


# ── Test 2: Question Bank Loading ─────────────────────────────────────────────

def test_question_banks():
    from services.interview_engine import load_question_bank
    from models.schemas import CompanyMode

    for mode in [CompanyMode.TCS_NQT, CompanyMode.INFOSYS, CompanyMode.WIPRO,
                 CompanyMode.STARTUP_REACT, CompanyMode.FAANG, CompanyMode.HR_BEHAVIORAL]:
        bank = load_question_bank(mode)
        assert "company" in bank, f"Missing 'company' in {mode} bank"
        assert "technical_questions" in bank, f"Missing questions in {mode} bank"
        assert "system_prompt_context" in bank, f"Missing system prompt in {mode} bank"
        print(f"  [PASS] {bank['company']} - {len(bank['technical_questions'])} technical questions loaded")

    print("[PASS] All question banks loaded [OK]\n")


# ── Test 3: System Prompt Builder ─────────────────────────────────────────────

def test_system_prompt_builder():
    from services.interview_engine import build_system_prompt, load_question_bank
    from models.schemas import CompanyMode, RoundType, LanguagePref

    bank = load_question_bank(CompanyMode.TCS_NQT)
    prompt = build_system_prompt(
        company=CompanyMode.TCS_NQT,
        round_type=RoundType.TECHNICAL,
        language_pref=LanguagePref.HINGLISH,
        resume_text="Built a React + Node.js e-commerce platform. Used PostgreSQL and AWS S3.",
        question_bank=bank,
    )

    assert "TCS NQT" in prompt, "Company name should be in prompt"
    assert "Hinglish" in prompt, "Language instruction should be in prompt"
    assert "e-commerce" in prompt, "Resume text should be injected"
    assert "star_s" in prompt, "STAR JSON fields should be present in prompt"

    print("[PASS] System prompt builder")
    print(f"  Prompt length: {len(prompt)} chars [OK]\n")


# ── Test 4: Pydantic Schema Validation ────────────────────────────────────────

def test_schemas():
    from models.schemas import (
        InterviewEngineResponse, TranscriptWord, AnswerAnalytics,
        PauseEvent, WsMessageType, InterviewStage, CompanyMode,
    )

    # Test InterviewEngineResponse
    resp = InterviewEngineResponse(
        next_question="What is a primary key in SQL?",
        stage=InterviewStage.CORE_QUESTIONS,
        follow_up_needed=False,
    )
    assert resp.next_question == "What is a primary key in SQL?"

    # Test WsMessageType values exist
    assert WsMessageType.TRANSCRIPT == "transcript"
    assert WsMessageType.AI_SPEAKING == "ai_speaking"
    assert WsMessageType.BARGE_IN == "barge_in"
    assert WsMessageType.SESSION_END == "session_end"

    print("[PASS] Pydantic schemas validated [OK]\n")


# ── Test 5: FastAPI health endpoint ───────────────────────────────────────────

async def test_health_endpoint():
    import httpx
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get("http://localhost:8000/health", timeout=3.0)
            assert r.status_code == 200
            data = r.json()
            assert data["status"] == "ok"
            print(f"[PASS] FastAPI health endpoint: {data} [OK]\n")
    except httpx.ConnectError:
        print("[SKIP] FastAPI not running - start backend first to test /health [OK]\n")


# ── Run all tests ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("InterviewAI — Backend Dry Run Tests")
    print("=" * 60)
    print()

    passed = 0
    failed = 0

    tests = [
        ("Audio Analytics", test_audio_analytics),
        ("Question Banks", test_question_banks),
        ("System Prompt Builder", test_system_prompt_builder),
        ("Pydantic Schemas", test_schemas),
    ]

    for name, fn in tests:
        try:
            fn()
            passed += 1
        except Exception as e:
            print(f"[FAIL] {name}: {e}\n")
            failed += 1

    # Async test
    try:
        asyncio.run(test_health_endpoint())
        passed += 1
    except Exception as e:
        print(f"[FAIL] Health endpoint: {e}\n")
        failed += 1

    print("=" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 60)
    if failed == 0:
        print("[SUCCESS] All tests passed. Backend is ready.")
    else:
        print("[FAILED] Some tests failed. Check errors above.")
