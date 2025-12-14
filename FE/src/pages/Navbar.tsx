// client/src/components/Navbar.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirect after logout
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.logo}>
                <Link to="/" style={styles.link}>Polyglot Goodreads</Link>
            </div>
            <div style={styles.navLinks}>
                <Link to="/" style={styles.link}>Books</Link>

                {isAuthenticated ? (
                    <>
                        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
                        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.link}>Login</Link>
                        <Link to="/signup" style={styles.link}>Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

// Minimal inline styles for a clean, professional look
const styles: { [key: string]: React.CSSProperties } = {
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 22px',
        backgroundColor: 'var(--nav-bg)',
        color: 'var(--nav-text)',
        borderBottom: '1px solid var(--card-border)',
    },
    logo: {
        fontSize: '1.5em',
        fontWeight: 'bold',
    },
    navLinks: {
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
    },
    link: {
        color: 'var(--nav-text)',
        textDecoration: 'none',
        padding: '6px 12px',
        borderRadius: '6px',
    },
    logoutButton: {
        background: 'transparent',
        border: '1px solid var(--card-border)',
        color: 'var(--nav-text)',
        padding: '6px 12px',
        cursor: 'pointer',
        borderRadius: '6px',
    }
};

export default Navbar;