# utils/rate_limiter.py
from fastapi import Request, HTTPException, status
from cache.redis import get_redis_client_direct

# Configuration
LIMIT = 5  # Max requests
WINDOW = 60 # Time window in seconds

async def rate_limit(request: Request):
    """
    Checks the rate limit for the client IP address using Redis.
    """
    # 1. Get the client IP address (or use a unique user identifier later)
    # Note: In production, you would need to get the IP from proxy headers (e.g., X-Forwarded-For).
    client_ip = request.client.host if request.client else "unknown_ip"
    
    # 2. Define the key and get the Redis client
    key = f"rate_limit:{client_ip}"
    redis = get_redis_client_direct()
    
    # 3. Use a Redis pipeline for atomic operations
    pipe = redis.pipeline()
    
    # Check the current count
    pipe.get(key)
    
    # Set the key expiration if it's the first request
    pipe.expire(key, WINDOW, nx=True)
    
    # Increment the request counter
    pipe.incr(key)
    
    # Execute the pipeline
    results = await pipe.execute()
    
    current_count = int(results[2])
    
    if current_count > LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {WINDOW} seconds."
        )
    
    print(f"Rate Limiter: IP {client_ip} Count {current_count}/{LIMIT}")