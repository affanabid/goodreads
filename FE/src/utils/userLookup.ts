// client/src/utils/userLookup.ts (NEW FILE)

// NOTE: In a production app, this would be an API call: 
// GET /users/details?ids=1,2,3 
// For now, we use a simple hardcoded map based on typical test data.

const USER_MOCK_MAP: Record<number, string> = {
    1: 'TestUser1 (Me)',
    2: 'Alice (Friend)',
    3: 'Bob (Friend)',
    4: 'Charlie (Friend)',
    5: 'Dianne (Friend)',
    // Add the user you signed up during Phase 1 testing
    7: 'Jon (New User)',
    // If you used your login email instead of username, adjust the ID here
};

export const getUsernameById = (userId: number): string => {
    return USER_MOCK_MAP[userId] || `User ${userId} (Unknown)`;
};