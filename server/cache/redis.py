# cache/redis.py
import redis.asyncio as redis
import os
from dotenv import load_dotenv

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = int(os.getenv("REDIS_PORT"))

redis_client: redis.Redis = None

async def connect_redis():
    """Initializes the Redis client."""
    global redis_client
    print("Connecting to Redis...")
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    # Test connection
    await redis_client.ping()
    print("Redis connection established.")

async def close_redis():
    """Closes the Redis connection."""
    if redis_client:
        await redis_client.close()
        print("Redis connection closed.")

# Dependency function to get the Redis client
async def get_redis_client():
    if redis_client:
        yield redis_client

def get_redis_client_direct() -> redis.Redis:
    """Returns the globally connected Redis client for service layer use."""
    global redis_client
    if not redis_client:
        # Should not happen if startup succeeded
        raise RuntimeError("Redis client is not initialized.")
    return redis_client