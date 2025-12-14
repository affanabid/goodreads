// client/src/api/socialService.ts (NEW FILE)
import { axiosInstance } from './axios';
import type { FollowRecommendations, BookRecommendations } from '../types/ApiTypes';

/**
 * Fetches "Who to Follow" recommendations (User IDs).
 * GET /users/{user_id}/recommendations (Neo4j)
 * NOTE: For now, we hardcode user_id=1 as the current user, 
 * as the user ID is not yet available in AuthContext.
 */
const HARDCODED_USER_ID = 1;

export const getFollowRecommendations = async (userId: number = HARDCODED_USER_ID): Promise<FollowRecommendations> => {
    const response = await axiosInstance.get<FollowRecommendations>(`/users/${userId}/recommendations`);
    return response.data;
};

/**
 * Fetches recommended Book IDs based on social connections.
 * GET /users/{user_id}/recommendations/books (Neo4j)
 */
export const getBookRecommendations = async (userId: number = HARDCODED_USER_ID): Promise<BookRecommendations> => {
    const response = await axiosInstance.get<BookRecommendations>(`/users/${userId}/recommendations/books`);
    return response.data;
};

/**
 * Creates a new follow relationship.
 * POST /users/{followee_id}/follow (Polyglot: Postgres + Neo4j)
 */
export const followUser = async (followeeId: number): Promise<void> => {
    // We send the current hardcoded user's ID as part of the URL, although the backend typically ignores 
    // this and uses the JWT token for the follower_id. We'll use the hardcoded ID for now 
    // to match the URL structure, assuming the backend uses the token for the follower.
    await axiosInstance.post(`/users/${followeeId}/follow`);
};

export const checkFollowStatus = async (followeeId: number): Promise<{ is_following: boolean }> => {
    const response = await axiosInstance.get<{ is_following: boolean }>(
        `/users/${followeeId}/follow/status`
    );
    return response.data;
};
