// client/src/components/ReviewForm.tsx
import React, { useState } from 'react';
import { postReview } from '../api/reviewService';
import type { ReviewInDB } from '../types/ApiTypes';

interface ReviewFormProps {
    bookId: string;
    onReviewPosted: (newReview: ReviewInDB) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ bookId, onReviewPosted }) => {
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (rating < 1 || rating > 5) {
            setError("Rating must be between 1 and 5.");
            setLoading(false);
            return;
        }

        try {
            // This triggers the Polyglot Write: Postgres review + Neo4j RATED relationship
            const newReview = await postReview(bookId, {
                rating,
                review_text: reviewText
            });

            setReviewText('');
            setRating(5);
            onReviewPosted(newReview); // Notify parent to refresh the list

        } catch (err: any) {
            console.error("Review post failed:", err.response?.data || err);
            const detail = err.response?.data?.detail || "Failed to submit review.";
            setError(detail);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.formContainer}>
            <h3>Write a Review</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={styles.fieldGroup}>
                    <label>Rating (1-5):</label>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        value={rating}
                        onChange={(e) => setRating(parseInt(e.target.value) || 1)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.fieldGroup}>
                    <label>Review Text:</label>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={4}
                        style={{ ...styles.input, resize: 'vertical' }}
                    />
                </div>
                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Submitting...' : 'Post Review'}
                </button>
            </form>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    // Review Form Styles (themed)
    formContainer: {
        border: '1px solid var(--card-border)',
        padding: '16px',
        borderRadius: '10px',
        marginBottom: '30px',
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text)'
    },
    fieldGroup: { marginBottom: '14px' },
    input: {
        width: '100%',
        padding: '10px',
        boxSizing: 'border-box',
        border: '1px solid var(--card-border)',
        borderRadius: '6px',
        marginTop: '6px',
        background: 'transparent',
        color: 'var(--text)'
    },
    button: {
        padding: '10px 15px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    },

};

export default ReviewForm;