# routes/books.py
from fastapi import APIRouter, Body, HTTPException, status, Depends, Path
from models.book import BookCreate, BookInDB
from models.review import ReviewCreate, ReviewInDB 
from services import book_service, review_service, follow_service # All services in one line
from db.postgres import get_db
from asyncpg import Connection
from typing import List
from utils.auth_bearer import JWTBearer  # Import JWT authentication

book_router = APIRouter(prefix="/books", tags=["Books & Reviews"])

# --- Endpoint 1: Create a Book (MongoDB) ---
@book_router.post("/", response_model=BookInDB, status_code=status.HTTP_201_CREATED)
async def create_new_book(book_data: BookCreate):
    """Creates a new book record in MongoDB."""
    
    new_book = await book_service.create_book(book_data)
    
    if new_book is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A book with this ISBN already exists or insertion failed."
        )
        
    return new_book

# --- Endpoint 2: Get a Book by ID (MongoDB) ---
@book_router.get("/{book_id}", response_model=BookInDB)
async def get_book_details(book_id: str):
    """Retrieves details for a single book by its Mongo ID."""
    
    book = await book_service.get_book_by_id(book_id)
    
    if book is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID {book_id} not found."
        )
        
    return book

# --- Endpoint 3: List Books (MongoDB) ---
@book_router.get("/", response_model=List[BookInDB])
async def list_all_books(limit: int = 10, skip: int = 0):
    """Lists all books, paginated."""
    return await book_service.list_books(limit, skip)

# --- Endpoint 4: Post Review (Postgres + Neo4j Polyglot Write) ---
@book_router.post(
    "/{book_id}/reviews", 
    response_model=ReviewInDB, 
    status_code=status.HTTP_201_CREATED
)
async def post_review(
    book_id: str = Path(..., description="The Mongo ID of the book"),
    review_data: ReviewCreate = Body(...),
    db: Connection = Depends(get_db),
    token_payload: dict = Depends(JWTBearer())  # JWT authentication
):
    """
    Allows a user to post a review (Postgres) and updates the Neo4j RATED graph.
    """
    user_id = token_payload.get("user_id")  # Extract user_id from JWT token

    # 1. Check if the book exists in Mongo
    if await book_service.get_book_by_id(book_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Book with ID {book_id} not found.")
        
    # 2. Create the review in Postgres (Transactional Write)
    new_review = await review_service.create_review(db, user_id, book_id, review_data)
    
    if new_review is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to submit review.")
        
    # 3. POLYGLOT WRITE: Update Neo4j Graph
    # The service function handles driver retrieval and session context internally.
    await follow_service.handle_rated_polyglot_write(
        user_id=user_id,
        book_id=book_id,
        rating=review_data.rating
    )
    
    return new_review

# --- Endpoint 5: List Reviews (Postgres) ---
@book_router.get("/{book_id}/reviews", response_model=List[ReviewInDB])
async def list_reviews(
    book_id: str = Path(..., description="The Mongo ID of the book"),
    db: Connection = Depends(get_db),
    limit: int = 10, skip: int = 0
):
    """Lists all reviews for a specific book."""
    return await review_service.get_reviews_for_book(db, book_id, limit, skip)