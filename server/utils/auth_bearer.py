# server/utils/auth_bearer.py
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from cache.redis import get_redis_client_direct
from typing import Optional
from jose import jwt, JWTError
import os

# JWT Configuration (Ensure these match your utils/security.py settings)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key") 
ALGORITHM = "HS256"

class JWTBearer(HTTPBearer):
    """
    Custom JWT Bearer scheme to extract and validate the token.
    Uses Redis to check if the session is active.
    """
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> dict:
        credentials: Optional[HTTPAuthorizationCredentials] = await super().__call__(request)
        
        if credentials:
            if credentials.scheme != "Bearer":
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid authentication scheme.")
            
            # 1. Validate and Decode the token
            token = credentials.credentials
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                user_id = payload.get("user_id")

            except JWTError:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token signature or expiration.")
            
            if user_id is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token payload missing user ID.")

            # 2. Check token against Redis cache (Session validation)
            redis = get_redis_client_direct()
            session_key = f"session:{token}"
            
            # Check if the token (session) is still active in Redis
            is_active = await redis.exists(session_key) 
            
            if not is_active:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or logged out.")
            
            # Return the payload data, which can be injected into route functions
            return payload

        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated.")