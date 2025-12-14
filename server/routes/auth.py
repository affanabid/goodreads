# routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from asyncpg import Connection
from models.user import UserCreate, UserLogin, UserInDB
from services import auth_service
from db.postgres import get_db
from graph.neo4j import create_user_node, get_neo4j_driver
from neo4j import AsyncDriver
from services import auth_service
from utils.rate_limiter import rate_limit
from typing import Optional
from fastapi.security import OAuth2PasswordRequestForm 

auth_router = APIRouter(prefix="/auth", tags=["Auth"])

# --- Endpoint 1: Signup ---
@auth_router.post("/signup", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: Connection = Depends(get_db), graph_driver: AsyncDriver = Depends(get_neo4j_driver)):
    # 1. Check if user already exists
    if await auth_service.get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # 2. Create user row in Postgres
    new_user = await auth_service.create_user(db, user_data)
    
    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user."
        )

    # 3. Create (:User) node in Neo4j (Event 1)
    await create_user_node(graph_driver, new_user.id)
    
    return new_user

# --- Endpoint 2: Login (Minimal version for now) ---
@auth_router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Connection = Depends(get_db), rate_check: None = Depends(rate_limit)):
    # 1. Verify password in Postgres
    user = await auth_service.get_user_by_email(db, form_data.username)
    
    if not user or not auth_service.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    # 2. Create JWT and store session in Redis
    token = await auth_service.create_user_session(user.id)
 
    return {
    "message": "Login successful", 
    "user_id": user.id, 
    "token": token, # Use 'token' key if that is what the frontend expects
    "access_token": token, # Include the standard OAuth key as well, for robustness
    "token_type": "bearer" # Standard OAuth key
}