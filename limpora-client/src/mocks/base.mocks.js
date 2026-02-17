export const isAuthenticated = true;

export const APP_COMISSION = 10; // ? Temp

export const ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
  PROVIDER: "provider"
};
export const MOCK_USER_ROLE = ROLES.PROVIDER;



export const mockUser = {
  id: 1,
  uid: 'firebase-mock-uid',
  email: 'test@test.com',
  name: 'Test User',
  role: MOCK_USER_ROLE,
  email_verified: true,
};
