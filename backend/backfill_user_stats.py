import os
from datetime import datetime, timezone, timedelta
from db.supabase_client import get_supabase
from dotenv import load_dotenv

load_dotenv()

def calculate_streaks(dates):
    """
    Given a sorted list of unique practice dates (datetime.date),
    calculate current_streak and longest_streak.
    """
    if not dates:
        return 0, 0

    longest_streak = 1
    current_streak = 1
    
    current = 1
    for i in range(1, len(dates)):
        if dates[i] - dates[i-1] == timedelta(days=1):
            current += 1
            longest_streak = max(longest_streak, current)
        else:
            current = 1

    # To compute the real current streak, check if the last practice date is today or yesterday
    today = datetime.now(timezone.utc).date()
    days_since_last = (today - dates[-1]).days
    
    if days_since_last > 1:
        # Streak broken
        current_streak = 0
    else:
        # Streak is active
        # Count backwards from the end to find the length of the current active streak
        current_streak = 1
        for i in range(len(dates) - 2, -1, -1):
            if dates[i+1] - dates[i] == timedelta(days=1):
                current_streak += 1
            else:
                break

    return current_streak, longest_streak

def main():
    supabase = get_supabase()
    
    print("Fetching all users...")
    users_res = supabase.table("users").select("id").execute()
    users = users_res.data
    
    print(f"Found {len(users)} users. Recalculating stats...")
    
    updated_count = 0
    
    for user in users:
        user_id = user["id"]
        
        # Fetch all completed sessions for this user
        sessions_res = supabase.table("sessions").select("started_at, overall_score").eq("user_id", user_id).eq("status", "completed").order("started_at", desc=False).execute()
        sessions = sessions_res.data
        
        if not sessions:
            continue
            
        best_score = 0
        practice_dates = set()
        last_practice_date = None
        
        for s in sessions:
            score = s.get("overall_score") or 0
            best_score = max(best_score, score)
            
            started_at_str = s.get("started_at")
            if started_at_str:
                # Parse ISO string
                try:
                    dt = datetime.fromisoformat(started_at_str.replace("Z", "+00:00"))
                    practice_dates.add(dt.date())
                    last_practice_date = started_at_str
                except Exception as e:
                    print(f"Error parsing date {started_at_str}: {e}")
        
        # Calculate streaks
        sorted_dates = sorted(list(practice_dates))
        current_streak, longest_streak = calculate_streaks(sorted_dates)
        
        print(f"User {user_id}: Best={best_score}, Current Streak={current_streak}, Longest={longest_streak}")
        
        # Update user
        supabase.table("users").update({
            "best_score": best_score,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "last_practice_date": last_practice_date
        }).eq("id", user_id).execute()
        
        updated_count += 1
        
    print(f"\nDone! Updated {updated_count} users.")

if __name__ == "__main__":
    main()
