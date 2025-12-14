# models/user.py
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Used for POST /auth/signup input
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

# Used for POST /auth/login input
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Used for database retrieval and API output
class UserInDB(BaseModel):
    id: int
    username: str
    email: EmailStr
    password_hash: str
    created_at: datetime

    class Config:
        # Allows ORM objects (like rows from asyncpg) to map to the model
        from_attributes = True