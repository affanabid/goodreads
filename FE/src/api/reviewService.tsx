// client/src/api/reviewService.ts (NEW FILE)
import { axiosInstance } from './axios';
import type { ReviewInDB, ReviewCreatePayload } from '../types/ApiTypes';

/**
 * Fetches all reviews for a specific book.
 * GET /books/{book_id}/reviews
 */
export const listReviews = async (bookId: string): Promise<ReviewInDB[]> => {
    const response = await axiosInstance.get<ReviewInDB[]>(`/books/${bookId}/reviews`);
    return response.data;
};

/**
 * Posts a new review (Polyglot Write: Postgres + Neo4j).
 * POST /books/{book_id}/reviews
 * This route is PROTECTED.
 */
export const postReview = async (bookId: string, payload: ReviewCreatePayload): Promise<ReviewInDB> => {
    // The JWT token in LocalStorage will be automatically included in the header
    const response = await axiosInstance.post<ReviewInDB>(`/books/${bookId}/reviews`, payload);
    return response.data;
};