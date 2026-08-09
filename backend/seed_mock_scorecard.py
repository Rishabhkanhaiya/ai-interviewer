import asyncio
import uuid
from datetime import datetime
from db.supabase_client import get_supabase
from dotenv import load_dotenv

load_dotenv()

USER_ID = "98c55602-2969-4a86-b58c-6b450f4dfa29"
SESSION_ID = str(uuid.uuid4())

def seed():
    supabase = get_supabase()
    
    # 1. Ensure user has a pack
    pack_res = supabase.table("packs").select("id").eq("user_id", USER_ID).limit(1).execute()
    pack_id = pack_res.data[0]["id"] if pack_res.data else None
    
    if not pack_id:
        pack_insert = supabase.table("packs").insert({
            "user_id": USER_ID,
            "pack_type": "placement_499",
            "rounds_total": 10,
            "minutes_total": 200,
        }).execute()
        pack_id = pack_insert.data[0]["id"]

    print(f"Creating mock session: {SESSION_ID}")
    
    # 2. Insert Session
    supabase.table("sessions").insert({
        "id": SESSION_ID,
        "user_id": USER_ID,
        "pack_id": pack_id,
        "company": "startup_react",
        "role": "frontend_dev",
        "round_type": "technical",
        "language_pref": "hinglish",
        "status": "completed",
        "ended_at": datetime.utcnow().isoformat(),
        "duration_seconds": 640,
        "overall_score": 75,
        "star_score": 3,
        "technical_score": 7,
        "communication_score": 8,
        "confidence_score": 9,
        "wpm_avg": 135,
        "filler_count": 4,
        "pause_count": 2,
        "comprehensive_summary": "The candidate demonstrated some knowledge of React and Node.js, but struggled to provide specific metrics and achievements, and failed to address common issues such as re-renders. They showed some potential in their project experience, but need to work on providing more detailed and technical responses to technical interview questions. Overall, the candidate needs to improve their technical knowledge and problem-solving skills to be competitive in the industry.",
        "error_analysis": [
            {
                "quote": "I built a social media app.",
                "mistake": "The candidate failed to provide specific metrics or achievements related to the project.",
                "fix": "Provide specific metrics or achievements, such as 'I built a social media app with a user base of 10,000 users.'",
                "better_example": "The candidate demonstrated strong project management skills by delivering a scalable app with a large user base."
            },
            {
                "quote": "But sometimes it re-renders too much.",
                "mistake": "The candidate failed to provide a solution or mitigation strategy for the issue of re-renders.",
                "fix": "Provide a solution or mitigation strategy, such as 'To mitigate re-renders, I would use the useMemo hook.'",
                "better_example": "The candidate demonstrated strong problem-solving skills by identifying the issue of re-renders and proposing a solution."
            }
        ]
    }).execute()

    # 3. Insert Answers
    supabase.table("session_answers").insert([
        {
            "session_id": SESSION_ID,
            "question_number": 1,
            "question_text": "Tell me about yourself.",
            "answer_transcript": "Hi I am a student at VIT Pune. I know React and Node.js. I built a social media app.",
            "answer_duration_seconds": 15,
            "wpm": 120,
            "filler_words": {"um": 2},
            "pause_timestamps": [],
            "star_s": 1, "star_t": 1, "star_a": 1, "star_r": 1,
            "answer_score": 6,
            "ai_feedback": "Good introduction, but missing specific metrics about your project impact.",
        },
        {
            "session_id": SESSION_ID,
            "question_number": 2,
            "question_text": "How do you handle state in React?",
            "answer_transcript": "I use useState and context API for global state. But sometimes it re-renders too much.",
            "answer_duration_seconds": 22,
            "wpm": 110,
            "filler_words": {"like": 1},
            "pause_timestamps": [],
            "star_s": 2, "star_t": 2, "star_a": 2, "star_r": 2,
            "answer_score": 7,
            "ai_feedback": "Good mention of context API, but you should discuss useMemo or useCallback when talking about re-renders.",
        }
    ]).execute()
    
    print(f"\n✅ MOCK SCORECARD SEEDED!")
    print(f"👉 CLICK HERE TO VIEW IT: http://localhost:3000/interview/scorecard/{SESSION_ID}")

if __name__ == "__main__":
    seed()
