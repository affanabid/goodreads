# db/mongodb.py
import motor.motor_asyncio
import os
from dotenv import load_dotenv
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")

mongo_client: Optional[AsyncIOMotorClient] = None

async def connect_mongo():
    """Initializes the MongoDB client."""
    global mongo_client
    print("Connecting to MongoDB...")
    mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    # Test connection by pinging the admin database
    await mongo_client.admin.command('ping')
    # Ensures the index is set on ISBN for quick lookup
    db = mongo_client[MONGO_DB]
    await db["books"].create_index("isbn", unique=True)
    print("MongoDB connection established.")

async def close_mongo():
    """Closes the MongoDB connection."""
    if mongo_client:
        mongo_client.close()
        print("MongoDB connection closed.")


# 🌟 NEW: Direct getter for use in services
def get_mongo_client_direct() -> AsyncIOMotorClient:
    """Returns the globally connected MongoDB client for service layer use."""
    global mongo_client
    if not mongo_client:
        raise RuntimeError("MongoDB client is not initialized.")
    return mongo_client


# Dependency function for FastAPI routes
async def get_mongo_db():
    if mongo_client:
        yield mongo_client[MONGO_DB]