from pydantic import BaseModel, Field, conint
from typing import Optional
from datetime import datetime

# Review input model (for POST)
class ReviewCreate(BaseModel):
    rating: conint(ge=1, le=5) = Field(..., description="Rating from 1 to 5")
    review_text: Optional[str] = Field(None, max_length=5000)

# Review output model (for GET)
class ReviewInDB(ReviewCreate):
    id: int
    user_id: int
    book_id: str
    created_at: datetime