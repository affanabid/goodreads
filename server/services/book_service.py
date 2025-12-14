# services/book_service.py
from db.mongo import get_mongo_client_direct
from models.book import BookCreate, BookInDB
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List
from bson import ObjectId
import os 

def get_books_collection():
    """Lazily retrieves the MongoDB 'books' collection after the client has been initialized 
    during application startup.
    """
    # 1. Get the initialized client
    mongo_client = get_mongo_client_direct() 
    
    # 2. Get the database instance
    db = mongo_client[os.getenv("MONGO_DB")] 
    
    # 3. Return the specific collection
    return db["books"]

async def create_book(book_data: BookCreate) -> Optional[BookInDB]:
    """Inserts a new book into MongoDB."""
    
    # 🌟 NEW: Get collection inside the function body
    BOOKS_COLLECTION = get_books_collection()
    
    book_dict = book_data.model_dump(by_alias=True)
    
    # Try to insert the document
    try:
        result = await BOOKS_COLLECTION.insert_one(book_dict)
        if result.inserted_id:
            # Fetch the newly created document for the correct output format
            new_book = await BOOKS_COLLECTION.find_one({"_id": result.inserted_id})
            if new_book:
                return BookInDB(**new_book)
    except Exception as e:
        # Handle duplicate key error (e.g., duplicate ISBN)
        if "duplicate key error" in str(e):
            print(f"MongoDB Error: Duplicate ISBN detected: {e}")
        else:
            print(f"MongoDB Error during book creation: {e}")
        return None
    return None

async def get_book_by_id(book_id: str) -> Optional[BookInDB]:
    """Retrieves a book by its MongoDB ObjectId."""
    
    # 🌟 NEW: Get collection inside the function body
    BOOKS_COLLECTION = get_books_collection()
    
    try:
        if not ObjectId.is_valid(book_id):
            return None
            
        book = await BOOKS_COLLECTION.find_one({"_id": ObjectId(book_id)})
        if book:
            return BookInDB(**book)
    except Exception as e:
        print(f"MongoDB Error during book retrieval: {e}")
        return None
    return None

async def list_books(limit: int = 10, skip: int = 0) -> List[BookInDB]:
    """Retrieves a list of books from MongoDB."""
    
    # 🌟 NEW: Get collection inside the function body
    BOOKS_COLLECTION = get_books_collection()
    
    books = []
    cursor = BOOKS_COLLECTION.find().limit(limit).skip(skip)
    
    async for document in cursor:
        books.append(BookInDB(**document))
        
    return books