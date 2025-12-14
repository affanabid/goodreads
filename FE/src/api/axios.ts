// client/src/api/axios.ts
import axios from 'axios';

// Set the base URL for the FastAPI backend
const API_BASE_URL = 'http://127.0.0.1:8000';

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Utility to set/get the JWT token in LocalStorage
const AUTH_TOKEN_KEY = 'goodreads_auth_token';
const USER_ID_KEY = 'goodreads_user_id'; // <-- NEW KEY

export const setAuthToken = (token: string, userId: number) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_ID_KEY, userId.toString());
    // Set the default Authorization header for ALL subsequent requests
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const getAuthToken = (): { token: string | null, userId: number | null } => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userId = localStorage.getItem(USER_ID_KEY);
    return { 
        token, 
        userId: userId ? parseInt(userId) : null 
    };
};

export const removeAuthToken = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    // Remove the default Authorization header
    delete axiosInstance.defaults.headers.common['Authorization'];
};

// Initialize the token on module load (for session persistence)
const { token: storedToken, userId: storedUserId } = getAuthToken(); 
if (storedToken) {
    // This sets the header on refresh, fixing the 403 issue
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}