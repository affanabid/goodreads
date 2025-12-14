# graph/neo4j.py
from neo4j import AsyncGraphDatabase
import os
from dotenv import load_dotenv
from neo4j import AsyncGraphDatabase, AsyncDriver

load_dotenv()

URI = os.getenv("NEO4J_URI")
USER = os.getenv("NEO4J_USER")
PASSWORD = os.getenv("NEO4J_PASSWORD")

driver: AsyncGraphDatabase.driver = None

async def connect_neo4j():
    """Initializes the Neo4j driver."""
    global driver
    print("Connecting to Neo4j...")
    driver = AsyncGraphDatabase.driver(URI, auth=(USER, PASSWORD))
    # Test connection
    await driver.verify_connectivity()
    print("Neo4j driver established.")

async def close_neo4j():
    """Closes the Neo4j driver."""
    if driver:
        await driver.close()
        print("Neo4j driver closed.")

# Dependency function to get the Neo4j driver
async def get_neo4j_driver():
    if driver:
        yield driver

async def create_user_node(driver: AsyncDriver, user_id: int):
    """Creates a User node in Neo4j, ensuring the ID is treated as an INTEGER."""
    query = """
    CREATE (:User {id: toInteger($user_id)})
    """
    async with driver.session() as session:
        # Pass the ID as an integer, and Cypher converts it to an integer property
        await session.run(query, user_id=int(user_id)) 
        print(f"Neo4j: Created User node for ID {user_id}")

# ... (get_neo4j_driver dependency remains the same)
def get_neo4j_driver_direct():
    """Returns the globally connected Neo4j driver for service layer use."""
    global driver
    if not driver:
        raise RuntimeError("Neo4j driver is not initialized.")
    return driver
    
# Dependency function to get the Neo4j driver (for FastAPI routes)
async def get_neo4j_driver():
    if driver:
        yield driver