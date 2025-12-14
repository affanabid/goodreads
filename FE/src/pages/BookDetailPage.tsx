// client/src/pages/BookDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookDetails } from '../api/bookService';
import type { BookInDB } from '../types/ApiTypes';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/reviewForm';
import ReviewList from '../components/reviewList';

const BookDetailPage: React.FC = () => {
    const { bookId } = useParams<{ bookId: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [book, setBook] = useState<BookInDB | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reviewRefreshKey, setReviewRefreshKey] = useState(0); // State to force ReviewList refresh

    useEffect(() => {
        if (!bookId) {
            navigate('/');
            return;
        }

        const fetchBook = async () => {
            try {
                const data = await getBookDetails(bookId);
                setBook(data);
            } catch (err: any) {
                console.error("Failed to fetch book:", err);
                setError(err.response?.data?.detail || "Book not found.");
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [bookId, navigate]);

    // Handler passed to ReviewForm to trigger a list refresh
    const handleReviewPosted = () => {
        // Increment the key to force the ReviewList component to re-fetch
        setReviewRefreshKey(prev => prev + 1);
    };

    if (loading) {
        return <div style={styles.container}>Loading Book Details...</div>;
    }

    if (error) {
        return <div style={styles.container}><h2 style={{ color: 'red' }}>Error: {error}</h2></div>;
    }

    if (!book) {
        return <div style={styles.container}>Book not found.</div>;
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>{book.title}</h1>
            <p style={styles.subtitle}>By {book.author}</p>
            <p><strong>ISBN:</strong> {book.isbn}</p>
            <p style={styles.description}>{book.description}</p>

            <h2 style={styles.sectionTitle}>Reviews</h2>

            {/* Review Form (Protected) */}
            {isAuthenticated ? (
                <ReviewForm bookId={bookId!} onReviewPosted={handleReviewPosted} />
            ) : (
                <p>Please log in to post a review.</p>
            )}

            {/* Review List (Postgres Data) */}
            <ReviewList bookId={bookId!} refreshTrigger={reviewRefreshKey} />
        </div>
    );
};

// Consolidated styles for all detail page components
const styles: { [key: string]: React.CSSProperties } = {
    container: { maxWidth: '900px', margin: '40px auto', padding: '22px', boxSizing: 'border-box' as 'border-box' },
    title: { fontSize: '2rem', marginBottom: '6px', color: 'var(--text)' },
    subtitle: { fontSize: '1.1rem', color: 'var(--muted)', marginBottom: '12px' },
    description: { lineHeight: 1.7, marginBottom: '30px', color: 'var(--text)' },
    sectionTitle: { borderBottom: '2px solid var(--card-border)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--text)' },
};

export default BookDetailPage;