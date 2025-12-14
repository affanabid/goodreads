# services/follow_service.py
from asyncpg import Connection
from models.follow import FollowRecord
from graph.neo4j import get_neo4j_driver_direct 
from typing import Optional
from neo4j import AsyncSession, AsyncTransaction

# --- Neo4j Transaction Function (FINAL FIX) ---

async def create_follow_relationship_neo4j_tx(tx: AsyncTransaction, follower_id: int, followee_id: int):
    """
    Creates a FOLLOWS relationship in Neo4j.
    Uses toString() for robust matching against potentially string-stored IDs.
    Returns the result, which is required by execute_write to complete the transaction.
    """
    query = """
    MATCH (follower:User) WHERE toString(follower.id) = toString($follower_id)
    MATCH (followee:User) WHERE toString(followee.id) = toString($followee_id)
    MERGE (follower)-[:FOLLOWS]->(followee)
    """
    return await tx.run(query, follower_id=follower_id, followee_id=followee_id)

# --- Postgres Operations ---

async def create_follow_record_postgres(conn: Connection, follower_id: int, followee_id: int) -> Optional[FollowRecord]:
    """Inserts a new follow record into the Postgres 'follows' table."""
    
    query = """
    INSERT INTO follows (follower_id, followee_id)
    VALUES ($1, $2)
    RETURNING follower_id, followee_id, created_at;
    """
    
    try:
        record = await conn.fetchrow(query, follower_id, followee_id)
        if record:
            return FollowRecord(**dict(record))
    except Exception as e:
        if "duplicate key value violates unique constraint" in str(e):
            print("Postgres Error: User already follows this person (Duplicate key).")
        else:
            print(f"Postgres error during follow creation: {e}")
        return None
    return None

# --- Combined Service Function ---
async def follow_user(pg_conn: Connection, follower_id: int, followee_id: int):
    """Handles the polyglot operation to follow a user."""
    
    if follower_id == followee_id:
        raise ValueError("Cannot follow yourself.")

    # 1. Write to Postgres
    pg_record = await create_follow_record_postgres(pg_conn, follower_id, followee_id)
    
    # --- Ensure IDs are integers for robust function passing ---
    follower_id_int = int(follower_id)
    followee_id_int = int(followee_id)
    
    # 2. Write to Neo4j (Revert to Classic Async Session Execution)
    neo4j_driver = get_neo4j_driver_direct()
    
    query = """
    MATCH (follower:User) WHERE toString(follower.id) = toString($follower_id)
    MATCH (followee:User) WHERE toString(followee.id) = toString($followee_id)
    MERGE (follower)-[:FOLLOWS]->(followee)
    """
    
    session = None
    try:
        follower_id_int = int(follower_id)
        followee_id_int = int(followee_id)
        
        # 1. Start the session context (this part uses 'async with')
        async with neo4j_driver.session() as session:
            # 2. Run the query directly within the session for simple writes (no explicit tx needed)
            await session.run(
                query,
                follower_id=follower_id_int, 
                followee_id=followee_id_int
            )
            # No explicit commit/rollback needed if using session.run(), it commits automatically
            # for a single write, which is simpler and often more robust for old drivers.

    except Exception as e:
        print(f"Neo4j Error during follow operation: {e}")
        # Note: If an explicit transaction (tx) was started, we would need to rollback here.
    # Return the Postgres record if successful
    return pg_record if pg_record else FollowRecord(follower_id=follower_id, followee_id=followee_id)

async def get_follow_recommendations(follower_id: int, limit: int = 5) -> List[int]:
    """
    Retrieves follow recommendations based on second-degree connections 
    (Friends-of-Friends, FOF) from Neo4j using the classic session method.
    """
    neo4j_driver = get_neo4j_driver_direct()
    follower_id_int = int(follower_id)
    
    query = """
    MATCH (user:User {id: $follower_id})-[:FOLLOWS]->()-[:FOLLOWS]->(recommendation:User)
    WHERE NOT (user)-[:FOLLOWS]->(recommendation) 
      AND user <> recommendation
    RETURN recommendation.id AS recommended_id
    LIMIT $limit
    """

    results = []
    
    # 🌟 CRITICAL FIX: Use the classic session structure for reads
    try:
        async with neo4j_driver.session() as session:
            # Run the read query directly within the session
            result = await session.run(query, follower_id=follower_id_int, limit=limit)
            
            # Fetch all data records
            records = await result.data()
            
            for record in records:
                # Convert the ID back to a standard Python int
                results.append(int(record['recommended_id'])) 
                
    except Exception as e:
        # Re-raise the exception after logging if needed, or handle it
        print(f"Neo4j Read Error: {e}")
        raise # Re-raise to trigger the 500 error in the route
        
    return results

async def create_rated_relationship_neo4j(session: AsyncSession, user_id: int, book_id: str, rating: int):
    """
    Creates or updates a :RATED relationship between a User and a Book in Neo4j.
    Uses the reliable session.run() method.
    """
    query = """
    // Match User: Use toString() for robustness
    MATCH (user:User) WHERE toString(user.id) = toString($user_id)
    
    // Merge Book: Create if it doesn't exist
    MERGE (book:Book {id: $book_id})
    
    // Merge the RATED relationship
    MERGE (user)-[r:RATED]->(book)
    ON CREATE SET r.rating = toInteger($rating), r.created_at = datetime()
    ON MATCH SET r.rating = toInteger($rating), r.updated_at = datetime()
    """
    
    # We use session.run() as it worked reliably for your environment
    await session.run(
        query, 
        user_id=int(user_id), # Ensure integer type is passed
        book_id=book_id, 
        rating=int(rating)    # Ensure integer type is passed
    )

async def get_book_recommendations(user_id: int, limit: int = 5) -> List[str]:
    """
    Retrieves book recommendations based on books highly rated by users the current user follows.
    (Neo4j: Social Recommendation/Collaborative Filtering)
    """
    neo4j_driver = get_neo4j_driver_direct()
    user_id_int = int(user_id)
    
    query = """
    // 1. Find books rated highly (e.g., >= 4 stars) by users the target user follows
    MATCH (u:User) WHERE toString(u.id) = toString($user_id)
    MATCH (u)-[:FOLLOWS]->(friend:User)-[r:RATED]->(book:Book)
    
    // 2. Filter: Only consider high ratings
    WHERE r.rating >= 4
    
    // 3. Exclude books the current user has already rated
    AND NOT (u)-[:RATED]->(book)
    
    // 4. Group results: Score by counting how many friends rated the book highly
    RETURN book.id AS recommended_book_id, COUNT(book) AS friends_who_rated
    ORDER BY friends_who_rated DESC, book.id DESC // Prioritize books rated by more friends
    LIMIT $limit
    """

    results = []
    
    try:
        async with neo4j_driver.session() as session:
            result = await session.run(query, user_id=user_id_int, limit=limit)
            records = await result.data()
            
            for record in records:
                # Book ID is a string (MongoDB ObjectId)
                results.append(record['recommended_book_id']) 
                
    except Exception as e:
        print(f"Neo4j Book Recommendation Read Error: {e}")
        raise # Re-raise to trigger 500
        
    return results

async def handle_rated_polyglot_write(user_id: int, book_id: str, rating: int):
    """Handles the polyglot write for the RATED relationship outside of the route context."""
    
    neo4j_driver = get_neo4j_driver_direct()
    
    try:
        # Use a separate session context to ensure it commits.
        async with neo4j_driver.session() as session:
            await create_rated_relationship_neo4j(
                session,
                user_id=user_id,
                book_id=book_id,
                rating=rating
            )
    except Exception as e:
        print(f"Neo4j RATED relationship creation failed in wrapper: {e}")

async def check_if_following(conn: Connection, follower_id: int, followee_id: int) -> bool:
    """Checks if a follower is following a followee in the Postgres 'follows' table."""
    query = """
    SELECT EXISTS (
        SELECT 1 FROM follows 
        WHERE follower_id = $1 AND followee_id = $2
    );
    """
    # fetchval returns the value of the first column of the first row (a boolean)
    # 
    return await conn.fetchval(query, follower_id, followee_id)