from asyncpg import Connection
from models.review import ReviewCreate, ReviewInDB
from typing import Optional, List

async def create_review(conn: Connection, user_id: int, book_id: str, review_data: ReviewCreate) -> Optional[ReviewInDB]:
    """Inserts a new review into the Postgres database."""
    
    query = """
    INSERT INTO reviews (user_id, book_id, rating, review_text)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, book_id, rating, review_text, created_at;
    """
    
    # Execute the insert query
    try:
        record = await conn.fetchrow(
            query, user_id, book_id, review_data.rating, review_data.review_text
        )
        if record:
            return ReviewInDB(**dict(record))
    except Exception as e:
        print(f"Postgres error during review creation: {e}")
        return None
    return None

async def get_reviews_for_book(conn: Connection, book_id: str, limit: int = 10, skip: int = 0) -> List[ReviewInDB]:
    """Retrieves all reviews for a specific book."""
    query = """
    SELECT id, user_id, book_id, rating, review_text, created_at
    FROM reviews 
    WHERE book_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
    """
    records = await conn.fetch(query, book_id, limit, skip)
    return [ReviewInDB(**dict(record)) for record in records]