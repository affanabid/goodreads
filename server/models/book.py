# models/book.py
from pydantic import BaseModel, Field, conint, BeforeValidator
from typing import Optional
from bson import ObjectId
from typing_extensions import Annotated

# ----------------------------------------------------------------------
# Helper function for Pydantic V2: Converts the MongoDB ObjectId to a string
# when loading data from the database.
# ----------------------------------------------------------------------
def objectid_to_str(v: ObjectId) -> str:
    """Converts a BSON ObjectId object to its string representation."""
    if isinstance(v, ObjectId):
        return str(v)
    # Allows Pydantic to handle string validation for input
    return v

# Annotated type alias for MongoDB ID handling
# This ensures that when Pydantic loads data from Mongo, it applies the conversion
MongoId = Annotated[str, BeforeValidator(objectid_to_str)]


# Book input model (for POST)
class BookCreate(BaseModel):
    title: str = Field(..., max_length=255)
    author: str = Field(..., max_length=100)
    isbn: str = Field(..., max_length=13)
    publication_year: conint(ge=1900)
    cover_url: Optional[str] = None
    
# Book output model (for GET, used by the service layer)
class BookInDB(BookCreate):
    # 🌟 Simplest Fix: Use the MongoId type alias for the ID field.
    # 'alias="_id"' ensures that when MongoDB returns the document, 
    # the '_id' field maps correctly to the 'id' field in the model.
    id: MongoId = Field(..., alias="_id")

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "id": "60c72b2f8a1d7f0001a1b2c3",
                "title": "The Polyglot API Guide",
                "author": "Affan",
                "isbn": "9781111111111",
                "publication_year": 2024,
                "cover_url": "http://example.com/cover.jpg"
            }
        }