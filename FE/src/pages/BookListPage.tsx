// client/src/pages/BookListPage.tsx
import React, { useState, useEffect } from 'react';
import { listBooks } from '../api/bookService';
import type { BookInDB } from '../types/ApiTypes';
import { useNavigate } from 'react-router-dom';

const BookListPage: React.FC = () => {
    const [books, setBooks] = useState<BookInDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                // Fetch first 10 books
                const data = await listBooks({ limit: 10, skip: 0 });
                setBooks(data);
            } catch (err: any) {
                console.error("Failed to fetch books:", err);
                setError(err.message || "Could not connect to book service.");
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const handleBookClick = (bookId: string) => {
        // Navigate to the Book Detail page (protected route)
        navigate(`/books/${bookId}`);
    };

    if (loading) {
        return <div style={styles.container}>Loading Books...</div>;
    }

    if (error) {
        return <div style={styles.container}><p style={{ color: 'red' }}>Error: {error}</p></div>;
    }

    if (books.length === 0) {
        return <div style={styles.container}>No books found. Please add some via the backend.</div>;
    }

    return (
        <div style={styles.container}>
            <h1>Book Catalog</h1>
            <div style={styles.bookList}>
                
                {books.map((book) => (
                    <div
                        key={book._id}
                        style={styles.bookCard}
                        onClick={() => handleBookClick(book._id)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={() => handleBookClick(book._id)}
                    >
                        <div style={styles.cardCover}>
                            {/* simple cover placeholder; real project can use book.coverUrl */}
                            <div style={styles.coverInner}>
                                {book.title ? book.title.charAt(0).toUpperCase() : '?'}
                            </div>
                        </div>

                        <div style={styles.cardBody}>
                            <h2 style={styles.title}>{book.title}</h2>
                            <p style={styles.meta}><strong>Author:</strong> {book.author || 'Unknown'}</p>
                            <p style={styles.meta}><strong>ISBN:</strong> {book.isbn || '—'}</p>
                            <p style={styles.description}>
                                {book.description
                                    ? (book.description.length > 160
                                        ? `${book.description.substring(0, 160)}...`
                                        : book.description)
                                    : 'No description available.'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Minimal inline styles
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: 'min(1200px, 96%)',
        margin: '40px auto',
        padding: '24px',
        boxSizing: 'border-box' as 'border-box',
        background: 'transparent',
    },
    bookList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginTop: '20px',
        alignItems: 'stretch',
    },
    bookCard: {
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
        borderRadius: '10px',
        padding: '16px',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--shadow)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    },
    cardCover: {
        minWidth: '88px',
        minHeight: '120px',
        borderRadius: '6px',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--accent) 0%, #182848 100%)',
        color: 'var(--nav-text)',
        fontSize: '28px',
        fontWeight: 700,
    },
    coverInner: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBody: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as 'column',
    },
    title: {
        margin: 0,
        fontSize: '1.25rem',
        marginBottom: '6px',
    },
    meta: {
        margin: 0,
        color: 'var(--muted)',
        fontSize: '0.9rem',
        marginBottom: '6px',
    },
    description: {
        marginTop: '8px',
        color: 'var(--text)',
        fontSize: '0.95rem',
        lineHeight: 1.4,
    },
};

export default BookListPage;