// client/src/components/BookRecommendationCard.tsx
import React, { useState, useEffect } from 'react';
import { getBookDetails } from '../api/bookService';
import type { BookInDB } from '../types/ApiTypes';
import { useNavigate } from 'react-router-dom';

interface BookCardProps {
    bookId: string;
}

const BookRecommendationCard: React.FC<BookCardProps> = ({ bookId }) => {
    const [book, setBook] = useState<BookInDB | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Fetch the MongoDB book details for the recommended ID
                const data = await getBookDetails(bookId);
                setBook(data);
            } catch (error) {
                console.error(`Failed to fetch details for book ID ${bookId}`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [bookId]);

    if (loading) {
        return <div style={styles.bookCard}>Loading Book ID: {bookId}...</div>;
    }

    if (!book) {
        return <div style={styles.bookCard}>Book Not Found.</div>;
    }

    const handleViewBook = () => {
        navigate(`/books/${book._id}`);
    };

    return (
        <div style={styles.bookCard} role="button" tabIndex={0} onClick={handleViewBook} onKeyPress={handleViewBook}>
            <div style={styles.cover}>{book.title ? book.title.charAt(0).toUpperCase() : '?'}</div>
            <div style={styles.content}>
                <h4 style={styles.bookTitle}>{book.title}</h4>
                <p style={styles.bookAuthor}>by {book.author || 'Unknown'}</p>
                <div style={{ marginTop: 8 }}>
                    <button onClick={(e) => { e.stopPropagation(); handleViewBook(); }} style={styles.viewButton}>
                        View Book
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    // Book Card Styles (from BookRecommendationCard.tsx)
    bookCard: {
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        padding: '12px',
        borderRadius: 10,
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--shadow)',
        cursor: 'pointer'
    },
    cover: {
        width: 64,
        height: 92,
        borderRadius: 6,
        background: 'linear-gradient(135deg, var(--accent) 0%, #334e9b 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        fontWeight: 700,
        flexShrink: 0
    },
    content: { flex: 1, display: 'flex', flexDirection: 'column' as 'column' },
    bookTitle: { fontSize: '1.05rem', margin: 0, color: 'var(--text)' },
    bookAuthor: { fontSize: '0.9rem', color: 'var(--muted)', marginTop: 6 },
    viewButton: { padding: '6px 10px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' },
};

export default BookRecommendationCard;