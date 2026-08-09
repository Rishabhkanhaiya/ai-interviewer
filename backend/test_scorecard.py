import asyncio
import json
from services.interview_engine import generate_final_scorecard
from models.schemas import CompanyMode, RoundType
from dotenv import load_dotenv

load_dotenv()

async def run_test():
    all_answers = [
        {
            "question": "Tell me about yourself.",
            "transcript": "Hi I am a student at VIT Pune. I know React and Node.js. I built a social media app.",
            "star_s": 1, "star_t": 1, "star_a": 1, "star_r": 1,
            "wpm": 120, "filler_count": 2,
            "ai_feedback": {
                "criteria_met": ["Mentioned tech stack", "Mentioned project"],
                "criteria_missed": ["No specific metrics", "No specific achievements"],
                "evidence_quote": "I built a social media app."
            }
        },
        {
            "question": "How do you handle state in React?",
            "transcript": "I use useState and context API for global state. But sometimes it re-renders too much.",
            "star_s": 2, "star_t": 2, "star_a": 2, "star_r": 2,
            "wpm": 110, "filler_count": 1,
            "ai_feedback": {
                "criteria_met": ["Mentioned useState and context"],
                "criteria_missed": ["Did not mention useMemo or useCallback for re-renders"],
                "evidence_quote": "sometimes it re-renders too much"
            }
        }
    ]

    print("Generating scorecard...")
    result = await generate_final_scorecard(
        all_answers=all_answers,
        company=CompanyMode.ALL_IN_ONE,
        round_type=RoundType.TECHNICAL
    )
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(run_test())
