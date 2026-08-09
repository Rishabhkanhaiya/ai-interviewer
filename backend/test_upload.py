from db.supabase_client import get_supabase
from datetime import datetime

def run():
    supabase = get_supabase()
    
    # Get all posts
    res = supabase.table("posts").select("*").execute()
    for post in res.data:
        # Strip trailing ? from cover_image_url
        cover_image_url = post.get("cover_image_url")
        if cover_image_url and cover_image_url.endswith('?'):
            cover_image_url = cover_image_url.rstrip('?')
        
        # Publish
        update_data = {
            "status": "published",
            "published_at": datetime.utcnow().isoformat(),
            "cover_image_url": cover_image_url
        }
        
        supabase.table("posts").update(update_data).eq("id", post["id"]).execute()
        print(f"Updated post '{post['title']}' to Published and stripped ? from cover image url!")

if __name__ == "__main__":
    run()
