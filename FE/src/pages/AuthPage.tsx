// client/src/pages/AuthPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, signupUser } from '../api/authService';
// import { AuthDetails } from '../types/ApiTypes';

interface AuthPageProps {
    isSignup?: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ isSignup = false }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignup) {
                // --- Signup Logic ---
                await signupUser({ email, username, password });
                alert("Signup successful! Please log in.");
                navigate('/login'); // Redirect to login
            } else {
                // --- Login Logic ---
                const data = await loginUser(username, password);
                if (data.access_token && data.user_id) { 
                    login(data as any); // Use 'any' here if types are tricky, but should use LoginSuccessResponse
                    navigate('/'); // Redirect to the main book list page
                } else {
                     setError("Login failed: Missing token or user ID in response.");
                }
            }
        } catch (err: any) {
            let errorMessage: string;

            if (err.response) {
                // Check for a specific FastAPI validation error (422)
                if (err.response.status === 422 && err.response.data && err.response.data.detail) {
                    // FastAPI validation errors return an array of objects. Format them.
                    const validationErrors = err.response.data.detail
                        .map((d: any) => `${d.loc[1]}: ${d.msg}`)
                        .join(' | ');
                    errorMessage = `Validation failed: ${validationErrors}`;
                }
                // Check for other standard errors (401 Unauthorized, 400 Bad Request, etc.)
                else if (err.response.data && err.response.data.detail) {
                    errorMessage = err.response.data.detail;
                } else {
                    errorMessage = `Server Error (${err.response.status})`;
                }
            } else {
                errorMessage = err.message || "An unknown network error occurred.";
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>{isSignup ? 'Sign Up' : 'Log In'}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                {isSignup && (
                    <div style={{ marginBottom: '10px' }}>
                        <label>Email:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                    </div>
                )}

                <div style={{ marginBottom: '10px' }}>
                    <label>Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
                    {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Log In')}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                {isSignup ? (
                    <a href="/login">Already have an account? Log In</a>
                ) : (
                    <a href="/signup">Need an account? Sign Up</a>
                )}
            </p>
        </div>
    );
};

export default AuthPage;