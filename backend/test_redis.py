import asyncio
from config import get_settings
from db.redis_client import get_redis

async def main():
    try:
        r = await get_redis()
        res = await r.ping()
        print("Redis ping response:", res)
    except Exception as e:
        print("Redis error:", type(e), e)

if __name__ == "__main__":
    asyncio.run(main())
