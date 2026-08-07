"""
Pydantic v2 schemas for all API request/response models.
These are the strict data contracts between frontend ↔ backend.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from enum import Enum
import uuid


# ── Enums ────────────────────────────────────────────────────────────────────

class CompanyMode(str, Enum):
    TCS_NQT = "tcs_nqt"
    INFOSYS = "infosys"
    WIPRO = "wipro"
    ACCENTURE = "accenture"
    CAPGEMINI = "capgemini"
    STARTUP_REACT = "startup_react"
    FAANG = "faang"
    HR_BEHAVIORAL = "hr_behavioral"
    ALL_IN_ONE = "all_in_one"
    CUSTOM = "custom"


class RoleType(str, Enum):
    SDE = "sde"
    BACKEND = "backend"
    FRONTEND = "frontend"
    FULL_STACK = "full_stack"
    DATA_SCIENCE = "data_science"


class RoundType(str, Enum):
    HR = "hr"
    TECHNICAL = "technical"
    MANAGERIAL = "managerial"


class LanguagePref(str, Enum):
    ENGLISH = "english"
    HINGLISH = "hinglish"
    HINDI = "hindi"


class InterviewStage(str, Enum):
    INTRO = "intro"
    ICEBREAKER = "icebreaker"
    COMPANY_FIT = "company_fit"
    TECHNICAL = "technical"
    RESUME_GRILL = "resume_grill"
    CLOSING = "closing"


class PackType(str, Enum):
    PLACEMENT_499 = "placement_499"
    TOPUP_199 = "topup_199"


class SessionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


# ── User Schemas ──────────────────────────────────────────────────────────────

class UserOnboarding(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    college: str = Field(..., min_length=2, max_length=200)
    graduation_year: int = Field(..., ge=2024, le=2030)
    target_companies: List[str] = Field(default_factory=list)


class UserProfile(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    college: Optional[str] = None
    graduation_year: Optional[int] = None
    target_companies: Optional[List[str]] = None


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    college: Optional[str] = Field(None, min_length=2, max_length=200)
    graduation_year: Optional[int] = Field(None, ge=2024, le=2030)
    target_companies: Optional[List[str]] = None


# ── Pack Schemas ──────────────────────────────────────────────────────────────

class PackStatus(BaseModel):
    pack_id: str
    pack_type: PackType
    rounds_total: int
    rounds_used: int
    rounds_remaining: int
    minutes_total: int
    minutes_used: float
    minutes_remaining: float
    has_active_pack: bool


class PackStatusResponse(BaseModel):
    has_active_pack: bool
    pack: Optional[PackStatus] = None


# ── Session Schemas ───────────────────────────────────────────────────────────

class StartSessionRequest(BaseModel):
    company: CompanyMode
    role: RoleType
    round_type: RoundType
    language_pref: LanguagePref = LanguagePref.HINGLISH
    resume_text: Optional[str] = Field(None, max_length=800)

    @field_validator("resume_text")
    @classmethod
    def strip_html(cls, v: Optional[str]) -> Optional[str]:
        """Strip any HTML/JS from resume text (security)."""
        if v is None:
            return v
        import re
        return re.sub(r"<[^>]+>", "", v).strip()


class StartSessionResponse(BaseModel):
    session_id: str
    voice_persona: str
    company_display_name: str
    stage: InterviewStage


class EndSessionRequest(BaseModel):
    session_id: str
    reason: str = "completed"  # completed | abandoned | timeout


# ── WebSocket Message Schemas ─────────────────────────────────────────────────

class WsMessageType(str, Enum):
    TRANSCRIPT = "transcript"
    AI_SPEAKING = "ai_speaking"
    AUDIO_CHUNK = "audio_chunk"
    SESSION_STATE = "session_state"
    BARGE_IN = "barge_in"
    WARNING = "warning"
    ERROR = "error"
    SESSION_END = "session_end"


class TranscriptWord(BaseModel):
    text: str
    start_ms: int
    end_ms: int
    confidence: float
    is_filler: bool = False
    language: str = "en"


class WsTranscriptMessage(BaseModel):
    type: str = WsMessageType.TRANSCRIPT
    words: List[TranscriptWord]
    full_text: str
    is_final: bool


class WsAiSpeakingMessage(BaseModel):
    type: str = WsMessageType.AI_SPEAKING
    text: str
    stage: str
    question_number: int


class WsSessionStateMessage(BaseModel):
    type: str = WsMessageType.SESSION_STATE
    stage: str
    question_number: int
    total_questions: int
    minutes_used: float
    pack_minutes_remaining: float
    status: str  # listening | thinking | speaking


class WsBargeInMessage(BaseModel):
    type: str = WsMessageType.BARGE_IN


class WsErrorMessage(BaseModel):
    type: str = WsMessageType.ERROR
    code: str
    message: str


class WsSessionEndMessage(BaseModel):
    type: str = WsMessageType.SESSION_END
    session_id: str
    scorecard_url: str


# ── Interview Engine Schemas ──────────────────────────────────────────────────

class DimensionEvaluation(BaseModel):
    score: int = Field(0, ge=0, le=10)
    criteria_met: List[str] = Field(default_factory=list)
    criteria_missed: List[str] = Field(default_factory=list)
    evidence_quote: str = ""

class PerTurnEvaluation(BaseModel):
    technical_depth: Optional[DimensionEvaluation] = None
    communication_clarity: Optional[DimensionEvaluation] = None
    star_structure: Optional[DimensionEvaluation] = None
    specificity_of_examples: Optional[DimensionEvaluation] = None
    answer_complete: bool = False
    follow_up_needed: bool = False
    follow_up_reason: Optional[str] = None

class BeliefState(BaseModel):
    skills_validated: List[str]
    skills_doubted: List[str]
    topics_to_avoid: List[str]
    overall_impression: str

class InterviewEngineResponse(BaseModel):
    """Strict JSON output schema from GPT-4o-mini. Validated by Pydantic."""
    interviewer_response: str
    stage: InterviewStage
    question_asked: bool
    evaluation: Optional[PerTurnEvaluation] = None
    belief_state: Optional[BeliefState] = None


# ── Analytics Schemas ─────────────────────────────────────────────────────────

class PauseEvent(BaseModel):
    start_ms: int
    duration_ms: int


class FillerWordCount(BaseModel):
    word: str
    count: int


class AnswerAnalytics(BaseModel):
    wpm: float
    filler_words: dict[str, int]
    pauses: List[PauseEvent]
    confidence_avg: float
    language_mix: dict[str, float]


# ── Scorecard Schemas ─────────────────────────────────────────────────────────

class AnswerFeedback(BaseModel):
    question_number: int
    question_text: str
    answer_transcript: str
    star_s: int
    star_t: int
    star_a: int
    star_r: int
    answer_score: int
    wpm: int
    filler_count: int
    ai_feedback: str
    confidence_avg: float


class ErrorAnalysis(BaseModel):
    quote: str
    mistake: str
    fix: str
    better_example: Optional[str] = None

class Scorecard(BaseModel):
    session_id: str
    company: str
    role: str
    round_type: str
    duration_seconds: int
    overall_score: int
    star_score: int
    technical_score: int
    communication_score: int
    confidence_score: int
    wpm_avg: int
    filler_count: int
    pause_count: int
    answers: List[AnswerFeedback]
    error_analysis: List[ErrorAnalysis]
    comprehensive_summary: str
    language_mix: dict[str, float]


# ── Payment Schemas ───────────────────────────────────────────────────────────

class CreateOrderRequest(BaseModel):
    pack_type: PackType
    affiliate_code: Optional[str] = None


class CreateOrderResponse(BaseModel):
    order_id: str
    amount_paise: int
    currency: str = "INR"
    razorpay_key_id: str


class ValidateAffiliateRequest(BaseModel):
    code: str


class ValidateAffiliateResponse(BaseModel):
    valid: bool
    referrer_name: Optional[str] = None
    discount_paise: int = 0


# ── Affiliate Schemas ─────────────────────────────────────────────────────────

class AffiliateRegisterResponse(BaseModel):
    code: str
    referral_url: str


class AffiliateDashboard(BaseModel):
    code: str
    referral_url: str
    total_referrals: int
    total_earned_paise: int
    pending_payout_paise: int
    upi_id: Optional[str] = None


class UpdateUpiRequest(BaseModel):
    upi_id: str = Field(..., pattern=r"^[a-zA-Z0-9.\-_]+@[a-zA-Z]+$")

class PushSubscriptionKeys(BaseModel):
    p256dh: str
    auth: str

class PushSubscriptionRequest(BaseModel):
    endpoint: str
    expirationTime: Optional[int] = None
    keys: PushSubscriptionKeys
