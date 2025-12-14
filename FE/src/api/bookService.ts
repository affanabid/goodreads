// client/src/api/bookService.ts
import { axiosInstance } from './axios';
import type { BookInDB } from '../types/ApiTypes';

interface ListBooksParams {
    limit?: number;
    skip?: number;
}

/**
 * Fetches a list of books from the MongoDB service endpoint.
 * GET /books/
 */
export const listBooks = async (params: ListBooksParams = {}): Promise<BookInDB[]> => {
    // Axios automatically serializes params object into the query string (?limit=10&skip=0)
    const response = await axiosInstance.get<BookInDB[]>('/books/', {
        params: params,
    });
    return response.data;
};

export const getBookDetails = async (bookId: string): Promise<BookInDB> => {
    const response = await axiosInstance.get<BookInDB>(`/books/${bookId}`);
    return response.data;
};