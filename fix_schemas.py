import re

file_path = 'backend/models/schemas.py'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update InterviewStage enum
content = re.sub(
    r'class InterviewStage\(str, Enum\):\n    INTRO = "intro"\n    WARMUP = "warmup"\n    CORE_QUESTIONS = "core_questions"\n    TECHNICAL_PUSHBACK = "technical_pushback"\n    CLOSING = "closing"',
    'class InterviewStage(str, Enum):\n    INTRO = "intro"\n    ICEBREAKER = "icebreaker"\n    COMPANY_FIT = "company_fit"\n    TECHNICAL = "technical"\n    RESUME_GRILL = "resume_grill"\n    CLOSING = "closing"',
    content
)

# 2. Update StarEvaluation
content = re.sub(
    r'class StarEvaluation\(BaseModel\):\n    star_s: int = Field\(\.\.\., ge=0, le=5\)  # Situation\n    star_t: int = Field\(\.\.\., ge=0, le=5\)  # Task\n    star_a: int = Field\(\.\.\., ge=0, le=5\)  # Action\n    star_r: int = Field\(\.\.\., ge=0, le=5\)  # Result',
    'class StarEvaluation(BaseModel):\n    star_s: int = Field(..., ge=0, le=5, description="Technical Depth")\n    star_t: int = Field(..., ge=0, le=5, description="Communication Clarity")\n    star_a: int = Field(..., ge=0, le=5, description="STAR Structure")\n    star_r: int = Field(..., ge=0, le=5, description="Specificity of Examples")',
    content
)

# 3. Add ErrorAnalysis and update Scorecard
scorecard_update = '''class ErrorAnalysis(BaseModel):
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
    language_mix: dict[str, float]'''

content = re.sub(
    r'class Scorecard\(BaseModel\):\n.*?language_mix: dict\[str, float\]',
    scorecard_update,
    content,
    flags=re.DOTALL
)

with open(file_path, 'w') as f:
    f.write(content)
