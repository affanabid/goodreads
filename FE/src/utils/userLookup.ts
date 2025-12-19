// client/src/utils/userLookup.ts (NEW FILE)

// NOTE: In a production app, this would be an API call: 
// GET /users/details?ids=1,2,3 
// For now, we use a simple hardcoded map based on typical test data.

const USER_MOCK_MAP: Record<number, string> = {
    1: 'Mark',
    2: 'Alice',
    3: 'Bob',
    4: 'Charlie',
    5: 'Dianne',
    7: 'Jon',
    8: 'Mike',
    9: 'Sid'
};

export const getUsernameById = (userId: number): string => {
    return USER_MOCK_MAP[userId] || `User ${userId} (Unknown)`;
};