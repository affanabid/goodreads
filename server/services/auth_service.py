# services/auth_service.py
from passlib.context import CryptContext
from asyncpg import Connection
from models.user import UserCreate, UserInDB
from typing import Optional
from passlib.context import CryptContext
from asyncpg import Connection
from models.user import UserCreate, UserInDB
from typing import Optional
from utils.security import create_access_token
from cache.redis import get_redis_client, get_redis_client_direct

# Configuration for password hashing
pwd_context = CryptContext(
    schemes=["sha256_crypt"],  # <--- CHANGED
    deprecated="auto"
)

def hash_password(password: str) -> str:
    """Hashes a password using SHA256."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

async def create_user(conn: Connection, user_data: UserCreate) -> Optional[UserInDB]:
    """Inserts a new user into the Postgres database."""
    hashed_password = hash_password(user_data.password)
    
    query = """
    INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, username, email, password_hash, created_at;
    """
    
    try:
        record = await conn.fetchrow(
            query, user_data.username, user_data.email, hashed_password
        )
        if record:
            return UserInDB(**dict(record))
    except Exception as e:
        # In a real app, check for unique constraint violation (e.g., email or username already exists)
        print(f"Postgres error during user creation: {e}")
        return None
    return None

async def get_user_by_email(conn: Connection, email: str) -> Optional[UserInDB]:
    """Retrieves a user by email from Postgres."""
    query = """
    SELECT id, username, email, password_hash, created_at
    FROM users WHERE username = $1;
    """
    record = await conn.fetchrow(query, email)
    if record:
        return UserInDB(**dict(record))
    return None

async def create_user_session(user_id: int) -> str:
    """Generates a JWT and stores the session key in Redis."""
    redis = get_redis_client_direct()
    
    # Generate JWT
    access_token = create_access_token(data={"user_id": user_id})
    
    # Store the user ID in Redis with the token as key (for quick lookup/validation)
    # TTL (Time to Live) matches the token expiry (30 minutes)
    await redis.set(f"session:{access_token}", str(user_id), ex=30 * 60)
    
    return access_token