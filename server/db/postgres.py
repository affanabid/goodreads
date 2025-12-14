# db/postgres.py
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

user = os.getenv("POSTGRES_USER", "postgres")
password = os.getenv("POSTGRES_PASSWORD", "password")
server = os.getenv("POSTGRES_HOST", "localhost")
port = os.getenv("POSTGRES_PORT", "5432")
db = os.getenv("POSTGRES_DB", "goodreads")

# Construct the DSN manually here using an f-string
POSTGRES_DSN = f"postgresql://{user}:{password}@{server}:{port}/{db}"
db_pool: asyncpg.Pool = None

async def connect_postgres():
    """Initializes the connection pool for Postgres."""
    global db_pool
    print("Connecting to Postgres...")
    db_pool = await asyncpg.create_pool(dsn=POSTGRES_DSN)
    print("Postgres connection pool established.")

async def close_postgres():
    """Closes the connection pool."""
    if db_pool:
        await db_pool.close()
        print("Postgres connection pool closed.")

# Dependency function to get a connection from the pool
async def get_db():
    if db_pool:
        async with db_pool.acquire() as connection:
            yield connection