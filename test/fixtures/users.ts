/**
 * User Test Fixtures
 * 
 * Pre-defined user data for testing
 */

export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'Admin123!@#',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  },
  
  user: {
    email: 'user@test.com',
    password: 'User123!@#',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
  },
  
  premium: {
    email: 'premium@test.com',
    password: 'Premium123!@#',
    firstName: 'Premium',
    lastName: 'User',
    role: 'user',
    subscription: 'premium',
  },
};

export const testProfiles = {
  mother: {
    name: 'Mom',
    relationship: 'mother',
    ageRange: 'adult',
    interests: ['gardening', 'cooking', 'reading'],
  },
  
  friend: {
    name: 'Best Friend',
    relationship: 'friend',
    ageRange: 'young-adult',
    interests: ['gaming', 'music', 'sports'],
  },
};
