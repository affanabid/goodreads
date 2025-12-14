from fastapi import APIRouter, Depends, HTTPException, status, Path
from services import follow_service
from db.postgres import get_db
from asyncpg import Connection
from models.follow import FollowRecord
from services import follow_service
from typing import List
from utils.auth_bearer import JWTBearer

follow_router = APIRouter(prefix="/users", tags=["Social Graph"])

# Test User ID (Replace with actual Auth/JWT dependency later)
HARDCODED_FOLLOWER_ID = 2

@follow_router.post("/{followee_id}/follow", response_model=FollowRecord)
async def follow_user_endpoint(
    followee_id: int = Path(..., description="The ID of the user to follow"),
    db: Connection = Depends(get_db),
    token_data: dict = Depends(JWTBearer())
):
    """
    Initiates a follow relationship between the authenticated user and the target user.
    (Polyglot: Writes to Postgres and Neo4j)
    """
    
    # follower_id = HARDCODED_FOLLOWER_ID
    follower_id = token_data.get("user_id")

    if not follower_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token data.")
    
    if follower_id == followee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot follow yourself."
        )

    try:
        record = await follow_service.follow_user(db, follower_id, followee_id)
        # If the follow already existed in Postgres, the service function returns the existing record.
        if record:
            return record
        
    except Exception as e:
        print(f"Follow endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to establish follow relationship."
        )
        
    # Handle the case where the follow already existed, but Neo4j merged it successfully
    return FollowRecord(follower_id=follower_id, followee_id=followee_id)

@follow_router.get("/{user_id}/recommendations", response_model=List[int])
async def get_recommendations_endpoint(
    user_id: int = Path(..., description="The ID of the user to get recommendations for"),
    limit: int = 5
):
    """
    Retrieves a list of suggested user IDs to follow based on graph analysis.
    (Neo4j: Second-degree connections)
    """
    
    # In a real app, user_id would be derived from the auth token
    # Since we are hardcoding follower_id=1 in other routes, we'll ensure 
    # we use the path user_id for flexibility here.
    
    try:
        recommendations = await follow_service.get_follow_recommendations(user_id, limit)
        return recommendations
    except Exception as e:
        print(f"Recommendation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve recommendations."
        )

@follow_router.get("/{user_id}/recommendations/books", response_model=List[str])
async def get_book_recommendations_endpoint(
    user_id: int = Path(..., description="The ID of the user needing book recommendations"),
    limit: int = 5
):
    """
    Retrieves a list of recommended Book IDs based on highly-rated books from followed users.
    (Neo4j: Collaborative Filtering)
    """
    
    try:
        recommendations = await follow_service.get_book_recommendations(user_id, limit)
        return recommendations
    except Exception as e:
        print(f"Book Recommendation endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve book recommendations."
        )

@follow_router.get("/{followee_id}/follow/status", 
                response_model=dict,
                dependencies=[Depends(JWTBearer())]) # <--- PROTECTED ROUTE
async def check_follow_status_endpoint(
    followee_id: int = Path(..., description="The ID of the user to check the follow status for"),
    db: Connection = Depends(get_db),
    token_data: dict = Depends(JWTBearer()) # Extract follower ID from JWT
):
    """
    Checks the follow status between the authenticated user (follower) 
    and the target user (followee).
    """
    follower_id = token_data.get("user_id")

    if not follower_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token data.")
    
    # User cannot check follow status on themselves
    if follower_id == followee_id:
        return {"is_following": True} 

    try:
        # Call the new service function (to be created below)
        is_following = await follow_service.check_if_following(db, follower_id, followee_id)
        return {"is_following": is_following}
    except Exception as e:
        print(f"Follow status check error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check follow status."
        )