// client/src/components/UserRecommendationCard.tsx
import React, { useState } from 'react';
import { getUsernameById } from '../utils/userLookup';
import { followUser } from '../api/socialService';

interface UserCardProps {
    userId: number;
}

const UserRecommendationCard: React.FC<UserCardProps> = ({ userId }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const username = getUsernameById(userId);

    const handleFollow = async () => {
        setLoading(true);
        try {
            await followUser(userId); // Polyglot write
            setIsFollowing(true);
        } catch (error) {
            alert(`Failed to follow ${username}. Ensure you are logged in.`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (isFollowing) {
        return (
            <div style={styles.card}>
                <div style={styles.left}>
                    <div style={styles.avatar}>{username ? username.charAt(0).toUpperCase() : '?'}</div>
                    <div style={styles.usernameWrap}>
                        <div style={styles.username}>{username}</div>
                        <div style={styles.smallText}>Following</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.card}>
            <div style={styles.left}>
                <div style={styles.avatar}>{username ? username.charAt(0).toUpperCase() : '?'}</div>
                <div style={styles.usernameWrap}>
                    <div style={styles.username}>{username}</div>
                    <div style={styles.smallText}>Suggested</div>
                </div>
            </div>

            <div>
                <button
                    onClick={handleFollow}
                    disabled={loading}
                    style={styles.followButton}
                >
                    {loading ? '...' : 'Follow'}
                </button>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    card: {
        padding: '12px',
        border: '1px solid var(--card-border)',
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--card-bg)'
    },
    left: { display: 'flex', gap: 10, alignItems: 'center' },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 9999,
        background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        fontSize: 18,
    },
    usernameWrap: { display: 'flex', flexDirection: 'column' as 'column' },
    username: { fontWeight: 700, color: 'var(--text)' },
    smallText: { fontSize: 12, color: 'var(--muted)' },
    followButton: { padding: '8px 15px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
};

export default UserRecommendationCard;