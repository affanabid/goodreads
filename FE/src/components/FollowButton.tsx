// client/src/components/FollowButton.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { checkFollowStatus, followUser } from '../api/socialService';

interface FollowButtonProps {
    reviewerId: number;
}

const FollowButton: React.FC<FollowButtonProps> = ({ reviewerId }) => {
    const { isAuthenticated, currentUserId } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Don't render the button if the user is not logged in or is viewing their own review
    if (!isAuthenticated || currentUserId === reviewerId) {
        return null;
    }
    
    // 1. Fetch the initial follow status on component load
    useEffect(() => {
        // Only run if the user is authenticated and not trying to follow themselves
        if (isAuthenticated && currentUserId && currentUserId !== reviewerId) {
            const fetchStatus = async () => {
                setLoading(true);
                try {
                    // Call the backend to check the current follow status
                    const data = await checkFollowStatus(reviewerId);
                    setIsFollowing(data.is_following);
                } catch (error) {
                    console.error("Failed to check follow status:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchStatus();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, currentUserId, reviewerId]);

    // 2. Handle the follow action (Polyglot Write)
    const handleFollow = async () => {
        setLoading(true);
        try {
            await followUser(reviewerId); // POST to create the relationship
            setIsFollowing(true); // Optimistically update state
        } catch (error) {
            alert("Failed to follow user. Ensure your backend Polyglot Write is functioning.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <button style={styles.button} disabled>Loading...</button>;
    }
    
    // 3. Render the button based on status
    return (
        <button
            onClick={handleFollow}
            disabled={isFollowing} // Disabled if already following
            style={isFollowing ? styles.followingButton : styles.followButton}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </button>
    );
};

// Minimal inline styles
const styles: { [key: string]: React.CSSProperties } = {
    button: {
        padding: '5px 10px',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.9em',
        transition: 'background-color 0.2s',
        marginLeft: '10px'
    },
    followButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: '1px solid #007bff'
    },
    followingButton: {
        backgroundColor: 'white',
        color: '#666',
        border: '1px solid #ccc',
        cursor: 'default',
    }
};

export default FollowButton;