// client/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { getFollowRecommendations, getBookRecommendations } from '../api/socialService';
import UserRecommendationCard from '../components/UserRecommendationCard';
import BookRecommendationCard from '../components/BookRecommendationCard';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
    // NOTE: Hardcoded user ID 1 for demonstration, assuming the current user is ID 1.
    // const CURRENT_USER_ID = 1;

    const { currentUserId, isAuthenticated } = useAuth();
    const [followRecs, setFollowRecs] = useState<number[]>([]);
    const [bookRecs, setBookRecs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !currentUserId) {
             setLoading(false);
             setError("Authentication error: User ID not available.");
             return;
        }
        const fetchRecommendations = async () => {
            try {
                console.log('--------------',currentUserId);
                // Fetch Neo4j Social Recommendations
                const followData = await getFollowRecommendations(currentUserId);
                setFollowRecs(followData);

                // Fetch Neo4j Book Recommendations
                const bookData = await getBookRecommendations(currentUserId);
                setBookRecs(bookData);

            } catch (err: any) {
                console.error("Failed to fetch dashboard data:", err.response?.data || err);
                setError("Failed to load recommendations. Ensure backend is running and you are authenticated.");
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [isAuthenticated, currentUserId]);

    if (loading) {
        return <div style={styles.container}>Loading Dashboard and Recommendations...</div>;
    }

    if (error) {
        return <div style={styles.container}><p style={{ color: 'red' }}>Error: {error}</p></div>;
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Welcome to Your Dashboard, {currentUserId}</h1>
            <p style={styles.subtitle}>Personalized recommendations from the social graph</p>

            <section>
                <h2 style={styles.sectionTitle}>📚 Recommended Books For You</h2>
                <div style={styles.cardGrid}>
                    {bookRecs.length > 0 ? (
                        bookRecs.map(bookId => (
                            <BookRecommendationCard key={bookId} bookId={bookId} />
                        ))
                    ) : (
                        <p>No book recommendations yet. Follow more users and rate some books!</p>
                    )}
                </div>
            </section>

            <section>
                <h2 style={styles.sectionTitle}>👥 People You Might Know</h2>
                <div style={styles.cardGrid}>
                    {followRecs.length > 0 ? (
                        followRecs.map(userId => (
                            <UserRecommendationCard key={userId} userId={userId} />
                        ))
                    ) : (
                        <p>No user recommendations right now.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

// Consolidated styles for all dashboard components
const styles: { [key: string]: React.CSSProperties } = {
    container: { maxWidth: '1100px', margin: '40px auto', padding: '24px', boxSizing: 'border-box' as 'border-box' },
    title: { fontSize: '1.9rem', marginBottom: '8px', color: 'var(--text)' },
    subtitle: { fontSize: '1rem', color: 'var(--muted)', marginBottom: '24px' },
    sectionTitle: { borderBottom: '1px solid var(--card-border)', paddingBottom: '8px', marginBottom: '18px', marginTop: '28px', color: 'var(--text)' },
    cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '36px' },
};

export default Dashboard;