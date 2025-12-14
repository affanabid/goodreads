// client/src/api/authService.ts
import { axiosInstance } from './axios';
import type { AuthTokenResponse, AuthDetails } from '../types/ApiTypes';

// --- Note: FastAPI expects Login/Token route data as Form Data, not JSON ---

export const loginUser = async (username: string, password: string): Promise<AuthTokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axiosInstance.post<AuthTokenResponse>(
        '/auth/login',
        formData.toString(),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );
    return response.data;
};

export const signupUser = async (details: AuthDetails & { password: string }): Promise<{ message: string }> => {
    // Signup endpoint expects JSON
    const response = await axiosInstance.post<{ message: string }>(
        '/auth/signup',
        details
    );
    return response.data;
};

export const pingAuth = async (): Promise<boolean> => {
    try {
        await axiosInstance.get('/auth/ping');
        return true;
    } catch (error) {
        return false;
    }
};