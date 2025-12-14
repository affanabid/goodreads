// client/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getAuthToken, setAuthToken, removeAuthToken, axiosInstance } from '../api/axios';

interface LoginSuccessResponse {
    message: string;
    user_id: number; // The user ID returned by your backend
    token: string;   // The JWT token
    access_token: string;
}

// Define the shape of the context state and actions
interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    currentUserId: number | null;
    login: (response: LoginSuccessResponse) => void;
    logout: () => void;
}

// Create the context with default/initial values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null); 


    // Load session from storage on app start
    useEffect(() => {
        const { token: storedToken, userId: storedUserId } = getAuthToken();
        if (storedToken && storedUserId) {
            setToken(storedToken);
            setCurrentUserId(storedUserId)
            // Re-apply token to axios instance
            // setAuthToken(storedToken);
        } else {
            removeAuthToken()
        }
        setLoading(false);

        // Intercept 401 errors
        const interceptor = axiosInstance.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    console.error("401 Unauthorized: Session expired or invalid token.");
                    logout(); // Log out on token failure
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosInstance.interceptors.response.eject(interceptor);
        };
    }, []);

    const login = (response: LoginSuccessResponse) => {
        setToken(response.access_token);
        setCurrentUserId(response.user_id); // <-- SET ID
        setAuthToken(response.access_token, response.user_id);
    };

    const logout = () => {
        setToken(null);
        removeAuthToken();
        setCurrentUserId(null);
        // Redirect logic handled by router in components
    };

    // While loading, we can show a minimal spinner or null
    if (loading) {
        return <div>Loading session...</div>;
    }

    const value = {
        isAuthenticated: !!token,
        token,
        currentUserId,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};