# main.py
from fastapi import FastAPI
from db.postgres import connect_postgres, close_postgres
from db.mongo import connect_mongo, close_mongo
from cache.redis import connect_redis, close_redis
from graph.neo4j import connect_neo4j, close_neo4j
from starlette.middleware.cors import CORSMiddleware
from routes.auth import auth_router
from routes.books import book_router
from routes.follows import follow_router
import asyncio

app = FastAPI(title="Polyglot Goodreads Clone MVP")

# --- CORS Configuration ---
origins = [
    "http://localhost:5173",  # Your frontend development server URL
    "http://127.0.0.1:5173",  # Include 127.0.0.1 just in case
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers (Authorization, Content-Type, etc.)
)

# --- Register Routes ---
app.include_router(auth_router)
app.include_router(book_router)
app.include_router(follow_router)

# --- Startup and Shutdown Events ---
@app.on_event("startup")
async def startup_db_client():
    """Connects to all databases on application startup."""
    print("Starting up...")
    
    # Connect to the faster databases first
    await connect_postgres()
    await connect_mongo()
    await connect_redis()
    
    # 🌟 NEW: Wait 5 seconds for Neo4j to be fully ready
    print("Waiting 5 seconds for Neo4j initialization...")
    await asyncio.sleep(5)
    
    await connect_neo4j() # <-- Neo4j connection attempt here
    
    print("All databases connected.")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Closes all database connections on application shutdown."""
    print("Shutting down...")
    await close_postgres()
    await close_mongo()
    await close_redis()
    await close_neo4j()
    print("All databases closed.")

# --- Root Endpoint (for testing) ---

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Polyglot Goodreads API is running."}

# Later: Register routes here (e.g., app.include_router(auth_router))


if __name__ == "__main__":
    import uvicorn
    # "main:app" string is required for reload to work
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)