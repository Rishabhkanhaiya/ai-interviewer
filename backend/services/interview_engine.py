"""
Phase 09 — Interview State Machine

Drives the entire interview logic:
- 5-stage state machine (intro → warmup → core → pushback → closing)
- Company-specific question bank injection
- Resume-based personalised questions
- Adaptive follow-up logic
- STAR scoring per answer
- Final scorecard generation

LLM backend: Grok (xAI) via OpenAI-compatible API (temporary)
             Switch USE_GROK=False in .env to revert to GPT-4o-mini
"""

import json
import re
import random
from pathlib import Path
from typing import Optional, AsyncGenerator
from openai import AsyncOpenAI
from config import get_settings
from models.schemas import (
    InterviewEngineResponse,
    StarEvaluation,
    InterviewStage,
    CompanyMode,
    RoundType,
    LanguagePref,
)

settings = get_settings()

# ── LLM Client (OpenAI-compatible — Groq inference for testing) ────────────
if settings.use_grok and settings.grok_api_key:
    # gsk_ prefix = Groq API key (groq.com) — ultra-fast inference
    client = AsyncOpenAI(
        api_key=settings.grok_api_key,
        base_url="https://api.groq.com/openai/v1",
    )
    _MODEL = "llama-3.3-70b-versatile"   # Best Groq model — fast + smart
    _SCORECARD_MODEL = "llama-3.3-70b-versatile"
else:
    client = AsyncOpenAI(api_key=settings.openai_api_key)
    _MODEL = "gpt-4o-mini"
    _SCORECARD_MODEL = "gpt-4o-mini"

QUESTION_BANKS_DIR = Path(__file__).parent.parent / "question_banks"

# ── Load Question Banks ───────────────────────────────────────────────────────

_question_bank_cache: dict[str, dict] = {}


def load_question_bank(company: CompanyMode) -> dict:
    """Load and cache company-specific question bank JSON."""
    bank_file_map = {
        CompanyMode.TCS_NQT: "tcs_nqt.json",
        CompanyMode.INFOSYS: "infosys.json",
        CompanyMode.WIPRO: "wipro.json",
        CompanyMode.ACCENTURE: "hr_behavioral.json",
        CompanyMode.CAPGEMINI: "hr_behavioral.json",
        CompanyMode.STARTUP_REACT: "startup_react.json",
        CompanyMode.FAANG: "faang_style.json",
        CompanyMode.HR_BEHAVIORAL: "hr_behavioral.json",
        CompanyMode.CUSTOM: "hr_behavioral.json",
    }
    filename = bank_file_map.get(company, "hr_behavioral.json")
    if filename not in _question_bank_cache:
        with open(QUESTION_BANKS_DIR / filename, "r", encoding="utf-8") as f:
            _question_bank_cache[filename] = json.load(f)
    return _question_bank_cache[filename]


# ── Stage Configuration ───────────────────────────────────────────────────────

STAGE_ORDER = [
    InterviewStage.INTRO,
    InterviewStage.WARMUP,
    InterviewStage.CORE_QUESTIONS,
    InterviewStage.TECHNICAL_PUSHBACK,
    InterviewStage.CLOSING,
]

STAGE_QUESTION_COUNTS = {
    InterviewStage.INTRO: 1,
    InterviewStage.WARMUP: 2,
    InterviewStage.CORE_QUESTIONS: 4,
    InterviewStage.TECHNICAL_PUSHBACK: 2,
    InterviewStage.CLOSING: 1,
}


def get_next_stage(current_stage: InterviewStage) -> Optional[InterviewStage]:
    """Return the next stage in the state machine, or None if closing is done."""
    idx = STAGE_ORDER.index(current_stage)
    if idx + 1 < len(STAGE_ORDER):
        return STAGE_ORDER[idx + 1]
    return None


# ── System Prompt Builder ─────────────────────────────────────────────────────

def build_system_prompt(
    company: CompanyMode,
    round_type: RoundType,
    language_pref: LanguagePref,
    resume_text: Optional[str],
    question_bank: dict,
) -> str:
    """
    Build the full GPT-4o-mini system prompt for a given interview configuration.
    Injects: company context, question bank, resume, language preference.
    """

    # Language instruction
    lang_instructions = {
        LanguagePref.ENGLISH: "Speak only in English. If the candidate responds in Hindi, politely ask them to respond in English.",
        LanguagePref.HINGLISH: "You may mix English and Hindi naturally (Hinglish). Accept and grade Hinglish answers without penalising the language. Judge logic and content, not grammar.",
        LanguagePref.HINDI: "Speak primarily in Hindi with some English technical terms. Accept Hindi responses fully.",
    }

    # Resume injection
    resume_context = ""
    if resume_text and resume_text.strip():
        resume_context = f"""
## Candidate Resume Summary
The candidate has provided this resume summary. Use it to ask specific questions about their projects and experience:
{resume_text.strip()}

Ask at least 1-2 questions directly referencing their stated projects or technologies.
"""

    # Question bank context
    tech_questions_sample = random.sample(
        question_bank.get("technical_questions", []),
        min(6, len(question_bank.get("technical_questions", [])))
    )
    warmup_sample = random.sample(
        question_bank.get("warmup_questions", []),
        min(2, len(question_bank.get("warmup_questions", [])))
    )

    prompt = f"""You are an AI interviewer conducting a {round_type.value} interview for {question_bank['company']}.

{question_bank['system_prompt_context']}

## Language Instruction
{lang_instructions[language_pref]}

{resume_context}

## Interview Flow
Follow this exact 5-stage structure:
1. INTRO: Brief greeting, set expectations (1 question/statement)
2. WARMUP: 2 easy opener questions to build confidence  
3. CORE_QUESTIONS: 4 substantive technical or behavioral questions
4. TECHNICAL_PUSHBACK: 2 follow-up/challenge questions on weak answers
5. CLOSING: 1 closing question, thank candidate

## Sample Questions for This Mode
Warmup: {json.dumps(warmup_sample, indent=2)}
Core Technical/HR: {json.dumps(tech_questions_sample, indent=2)}

## Output Format — CRITICAL
You MUST respond ONLY with valid JSON matching this exact schema. No extra text outside JSON.

{{
  "next_question": "The exact question to ask the candidate",
  "stage": "intro | warmup | core_questions | technical_pushback | closing",
  "follow_up_needed": false,
  "follow_up_reason": null,
  "evaluation": {{
    "star_s": 0,
    "star_t": 0,
    "star_a": 0,
    "star_r": 0,
    "technical_score": 0,
    "answer_complete": true,
    "follow_up_needed": false,
    "follow_up_reason": null
  }}
}}

## Scoring Rules
- star_s/t/a/r: 0-5 each (0=missing, 5=excellent)
- technical_score: 0-10 (0=wrong, 10=excellent)
- answer_complete: false if candidate gave a very short/vague answer
- follow_up_needed: true if star_a < 3 OR technical_score < 4 OR answer_complete = false

## Adaptive Follow-up Rules
- If star_a < 3: follow up with "What specifically did YOU do in that situation?"
- If technical_score < 4: follow up with "Can you explain how that would work technically?"
- If answer_complete = false: follow up with "Could you elaborate on that? Tell me more."
"""
    return prompt


# ── Get Next Question ─────────────────────────────────────────────────────────

async def get_next_question(
    current_stage: InterviewStage,
    transcript_so_far: list[dict],
    company: CompanyMode,
    round_type: RoundType,
    language_pref: LanguagePref,
    resume_text: Optional[str] = None,
    question_number: int = 1,
) -> InterviewEngineResponse:
    """
    Call GPT-4o-mini to get the next interview question.
    Validates the JSON output strictly with Pydantic.

    Args:
        current_stage: Current interview stage
        transcript_so_far: Full conversation so far [{role, content}]
        company: Company mode
        round_type: HR / Technical / Managerial
        language_pref: English / Hinglish / Hindi
        resume_text: Pasted resume text (optional)
        question_number: Current question index

    Returns:
        InterviewEngineResponse — validated Pydantic model
    """
    question_bank = load_question_bank(company)
    system_prompt = build_system_prompt(
        company, round_type, language_pref, resume_text, question_bank
    )

    # Build message history for context window
    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history (last 10 turns max to save tokens)
    for turn in transcript_so_far[-10:]:
        messages.append({
            "role": turn.get("role", "user"),
            "content": turn.get("content", ""),
        })

    # Add current stage context
    messages.append({
        "role": "user",
        "content": f"[SYSTEM: Current stage is {current_stage.value}. Question number {question_number}. Generate the next question.]",
    })

    response = await client.chat.completions.create(
        model=_MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=500,
        response_format={"type": "json_object"},
    )

    raw_json = response.choices[0].message.content

    try:
        data = json.loads(raw_json)
        return InterviewEngineResponse(**data)
    except Exception as e:
        # Fallback if JSON parsing fails — never crash the session
        return InterviewEngineResponse(
            next_question="Can you tell me more about your experience with this topic?",
            stage=current_stage,
            follow_up_needed=False,
        )


# ── Stream Next Question (for sentence-boundary TTS) ─────────────────────────

async def stream_question_tokens(
    current_stage: InterviewStage,
    transcript_so_far: list[dict],
    company: CompanyMode,
    round_type: RoundType,
    language_pref: LanguagePref,
    resume_text: Optional[str] = None,
    question_number: int = 1,
) -> AsyncGenerator[str, None]:
    """
    Stream GPT-4o-mini tokens for sentence-boundary TTS pipeline (Phase 10).
    Yields the 'next_question' text token by token.
    """
    question_bank = load_question_bank(company)
    system_prompt = build_system_prompt(
        company, round_type, language_pref, resume_text, question_bank
    )

    messages = [{"role": "system", "content": system_prompt}]
    for turn in transcript_so_far[-10:]:
        messages.append({"role": turn.get("role", "user"), "content": turn.get("content", "")})
    messages.append({
        "role": "user",
        "content": f"[SYSTEM: Stage={current_stage.value}, Q={question_number}. Give ONLY the next_question value as plain text, no JSON wrapper.]",
    })

    stream = await client.chat.completions.create(
        model=_MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=200,
        stream=True,
    )

    async for chunk in stream:
        token = chunk.choices[0].delta.content
        if token:
            yield token


# ── Final Scorecard Generator ─────────────────────────────────────────────────

async def generate_final_scorecard(
    all_answers: list[dict],
    company: CompanyMode,
    round_type: RoundType,
) -> dict:
    """
    Generate session-level scorecard from all answers.
    Returns top 3 improvements and star weakest component.

    Args:
        all_answers: List of {question, transcript, star_s, star_t, star_a, star_r, wpm, filler_count}

    Returns:
        {top_improvements: [...], star_weakest_component: str, overall_score: int, ...}
    """
    answers_summary = json.dumps(all_answers, indent=2)

    prompt = f"""You are a career coach analyzing a mock interview for {company.value} ({round_type.value} round).

Here are all the question-answer pairs with their scores:
{answers_summary}

Please provide:
1. Top 3 specific, actionable improvement tips (NOT generic advice)
2. The weakest STAR component across all answers (S, T, A, or R)
3. One sentence explanation of why that component is weak

Format as JSON:
{{
  "top_improvements": [
    "Specific improvement 1",
    "Specific improvement 2", 
    "Specific improvement 3"
  ],
  "star_weakest_component": "ACTION",
  "weakest_explanation": "One sentence explanation"
}}
"""

    response = await client.chat.completions.create(
        model=_SCORECARD_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=400,
        response_format={"type": "json_object"},
    )

    try:
        return json.loads(response.choices[0].message.content)
    except Exception:
        return {
            "top_improvements": [
                "Practice structuring answers using the STAR method",
                "Reduce filler words by pausing instead of saying 'basically' or 'um'",
                "Speak at 120-150 WPM for clearest communication",
            ],
            "star_weakest_component": "ACTION",
            "weakest_explanation": "Focus on explaining exactly what you personally did in each situation.",
        }


# ── Per-Answer Feedback Generator ────────────────────────────────────────────

async def generate_per_answer_feedback(
    question: str,
    transcript: str,
    star_scores: dict,
    company: CompanyMode,
) -> str:
    """
    Generate a 2-3 sentence specific improvement note for one answer.
    """
    prompt = f"""You are a mock interview coach. Give 2-3 specific, actionable feedback sentences for this answer.
Do NOT be vague. Reference actual content from their answer.

Question: {question}
Answer: {transcript}
STAR Scores — S:{star_scores.get('s',0)}/5 T:{star_scores.get('t',0)}/5 A:{star_scores.get('a',0)}/5 R:{star_scores.get('r',0)}/5

Write feedback in 2-3 sentences. Be direct and specific. Start with what was good, then what to improve."""

    response = await client.chat.completions.create(
        model=_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=150,
    )
    return response.choices[0].message.content.strip()


# ── Interview Engine Class ───────────────────────────────────────────────────

class InterviewEngine:
    def __init__(self, session_id: str, user_id: str):
        self.session_id = session_id
        self.user_id = user_id
        self.transcript = []
        self.answers = []
        self.current_stage = InterviewStage.INTRO
        self.question_number = 1
        self.config = {}
        self.user_email = None

    async def initialize(self, session_config: dict):
        self.config = session_config
        
        # Get user email to bypass limits
        try:
            from db.supabase_client import get_supabase
            supabase = get_supabase()
            res = supabase.table("users").select("email").eq("id", self.user_id).single().execute()
            if res.data:
                self.user_email = res.data.get("email")
        except Exception as e:
            print(f"[InterviewEngine] Error loading user email: {e}")

    async def get_next_question(self):
        if self.current_stage is None:
            return None
            
        company = CompanyMode(self.config.get("company", "hr_behavioral"))
        round_type = RoundType(self.config.get("round_type", "hr"))
        lang = LanguagePref(self.config.get("language_pref", "hinglish"))
        resume = self.config.get("resume_text", "")
        
        response = await get_next_question(
            self.current_stage,
            self.transcript,
            company,
            round_type,
            lang,
            resume,
            self.question_number
        )
        
        # Save evaluation of the PREVIOUS answer if it exists
        if len(self.answers) > 0 and hasattr(response, 'evaluation'):
            eval_data = response.evaluation
            if eval_data:
                self.answers[-1]["star_s"] = eval_data.star_s
                self.answers[-1]["star_t"] = eval_data.star_t
                self.answers[-1]["star_a"] = eval_data.star_a
                self.answers[-1]["star_r"] = eval_data.star_r
                self.answers[-1]["technical_score"] = eval_data.technical_score

        # Update stage from response
        try:
            self.current_stage = InterviewStage(response.stage)
        except ValueError:
            pass # keep current stage if invalid string returned
            
        self.transcript.append({"role": "assistant", "content": response.next_question})
        
        from services.sarvam_tts import get_persona_for_round
        persona = get_persona_for_round(round_type.value, company.value)
        
        return {
            "text": response.next_question,
            "number": self.question_number,
            "persona": persona
        }

    async def process_answer(self, transcript, wpm, filler_words, word_timestamps, confidence):
        self.transcript.append({"role": "user", "content": transcript})
        
        self.answers.append({
            "question": self.transcript[-2]["content"] if len(self.transcript) > 1 else "",
            "transcript": transcript,
            "wpm": wpm,
            "filler_count": len(filler_words),
            "confidence": confidence,
            "star_s": 0, "star_t": 0, "star_a": 0, "star_r": 0, "technical_score": 0
        })
        
        self.question_number += 1
        if self.question_number > sum(STAGE_QUESTION_COUNTS.values()):
            self.current_stage = None
        else:
            # Advance based on counts
            count = 0
            for stage in STAGE_ORDER:
                count += STAGE_QUESTION_COUNTS[stage]
                if self.question_number <= count:
                    self.current_stage = stage
                    break

    async def generate_scorecard(self):
        company = CompanyMode(self.config.get("company", "hr_behavioral"))
        round_type = RoundType(self.config.get("round_type", "hr"))
        scorecard = await generate_final_scorecard(self.answers, company, round_type)
        
        try:
            from db.supabase_client import get_supabase
            supabase = get_supabase()
            supabase.table("sessions").update({
                "status": "completed",
                "transcript": self.transcript,
                "scorecard": scorecard
            }).eq("id", self.session_id).execute()
        except Exception:
            pass
            
        return scorecard

    async def save_partial_session(self):
        try:
            from db.supabase_client import get_supabase
            supabase = get_supabase()
            supabase.table("sessions").update({
                "transcript": self.transcript
            }).eq("id", self.session_id).execute()
        except Exception:
            pass

    async def check_and_increment_pack(self) -> bool:
        print("[LIMIT BYPASS] Bypassing limits for all users (free all)")
        return True

