// client/src/types/ApiTypes.ts

// --- Auth ---
export interface AuthTokenResponse {
    access_token: string;
    token_type: string;
    user_id: number;
}

export interface AuthDetails {
    email: string;
    username: string;
    // Note: Password is only sent in payload, not stored/returned
}

// --- User/Follow ---
export interface FollowRecord {
    follower_id: number;
    followee_id: number;
    created_at?: string;
}

// --- Books (MongoDB) ---
export interface BookInDB {
    _id: string; // MongoDB ObjectId
    title: string;
    author: string;
    isbn: string;
    description: string;
}

// --- Reviews (Postgres) ---
export interface ReviewInDB {
    id: number; // Postgres ID
    user_id: number;
    book_id: string;
    rating: number;
    review_text: string;
    created_at: string;
}

export interface ReviewCreatePayload {
    rating: number;
    review_text?: string;
}

// --- Recommendation Types (Neo4j) ---
export type FollowRecommendations = number[]; // List of User IDs
export type BookRecommendations = string[]; // List of Book IDs