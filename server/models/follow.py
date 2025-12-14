from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class FollowRecord(BaseModel):
    follower_id: int = Field(..., description="The ID of the user initiating the follow.")
    followee_id: int = Field(..., description="The ID of the user being followed.")
    created_at: Optional[datetime] = None