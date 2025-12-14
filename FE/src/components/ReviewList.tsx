// client/src/components/ReviewList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { listReviews } from '../api/reviewService';
import type { ReviewInDB } from '../types/ApiTypes';
import { useAuth } from '../context/AuthContext'; // <-- NEW IMPORT
import FollowButton from './FollowButton'; // <-- NEW IMPORT

interface ReviewListProps {
    bookId: string;
    // Prop to manually trigger a refresh after a new review is posted
    refreshTrigger: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ bookId, refreshTrigger }) => {
    const [reviews, setReviews] = useState<ReviewInDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { isAuthenticated } = useAuth(); // <-- ACCESS AUTH CONTEXT
    
    // This function is now the primary data fetcher
    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listReviews(bookId);
            setReviews(data);
        } catch (err: any) {
            console.error("Failed to fetch reviews:", err);
            setError("Could not load reviews.");
        } finally {
            setLoading(false);
        }
    }, [bookId]);

    // Effect runs on mount and whenever refreshTrigger changes
    useEffect(() => {
        fetchReviews();
    }, [fetchReviews, refreshTrigger]);

    if (loading) {
        return <p>Loading reviews...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (reviews.length === 0) {
        return <p>No reviews yet. Be the first to rate this book!</p>;
    }

    return (
        <div style={styles.listContainer}>
            {reviews.map((review) => (
                <div key={review.id} style={styles.reviewCard}>
                    <div style={styles.reviewHeader}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {/* Reviewer Identifier */}
                            <span style={styles.username}>User ID: {review.user_id}</span>
                            
                            {/* 🌟 INTEGRATE FOLLOW BUTTON */}
                            {/* Only show if authenticated */}
                            {isAuthenticated && (
                                <FollowButton reviewerId={review.user_id} />
                            )}
                        </div>
                        
                        <span style={styles.rating}>⭐ {review.rating} / 5</span>
                    </div>
                    <p style={styles.reviewText}>{review.review_text}</p>
                    <small>Posted on: {new Date(review.created_at).toLocaleDateString()}</small>
                </div>
            ))}
        </div>
    );
};
const styles: { [key: string]: React.CSSProperties } = {
    listContainer: { marginTop: '20px' },
    reviewCard: {
        border: '1px solid var(--card-border)',
        padding: '15px',
        marginBottom: '12px',
        borderRadius: '8px',
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text)'
    },
    reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    username: { fontWeight: '600' },
    rating: { color: 'var(--accent-2)', fontWeight: 600 },
    reviewText: { margin: '6px 0' },
};

export default ReviewList;