/**
 * Auth Utility Functions
 * Handles authentication token and user management
 */

export const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return 'User';

  const normalized = role.trim().toLowerCase();
  const roleMap = {
    admin: 'Admin',
    manager: 'Manager',
    technician: 'Technician',
    user: 'User',
    employee: 'User', // alias
  };

  return roleMap[normalized] || 'User';
};

// Token management
const PERSISTENT_STORAGE = localStorage;
const SESSION_STORAGE = sessionStorage;

const readAuthValue = (key) => {
  return PERSISTENT_STORAGE.getItem(key) ?? SESSION_STORAGE.getItem(key);
};

const writeAuthValue = (key, value, remember = true) => {
  const target = remember ? PERSISTENT_STORAGE : SESSION_STORAGE;
  const other = remember ? SESSION_STORAGE : PERSISTENT_STORAGE;
  target.setItem(key, value);
  other.removeItem(key);
};

export const setAuthToken = (accessToken, refreshToken, remember = true) => {
  writeAuthValue('accessToken', accessToken, remember);
  if (refreshToken) {
    writeAuthValue('refreshToken', refreshToken, remember);
  }
};

export const getAccessToken = () => {
  return readAuthValue('accessToken');
};

export const getRefreshToken = () => {
  return readAuthValue('refreshToken');
};

export const clearAuthToken = () => {
  PERSISTENT_STORAGE.removeItem('accessToken');
  PERSISTENT_STORAGE.removeItem('refreshToken');
  SESSION_STORAGE.removeItem('accessToken');
  SESSION_STORAGE.removeItem('refreshToken');
};

// User management
export const getStoredUser = () => {
  const rawUser = readAuthValue('user');

  if (!rawUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(rawUser);
    return {
      ...parsedUser,
      role: normalizeRole(parsedUser.role),
    };
  } catch (error) {
    console.error('Failed to parse stored user:', error);
    return null;
  }
};

export const setStoredUser = (user, remember = true) => {
  if (user) {
    writeAuthValue('user', JSON.stringify({
      ...user,
      role: normalizeRole(user.role),
    }), remember);
  }
};

export const clearStoredUser = () => {
  PERSISTENT_STORAGE.removeItem('user');
  SESSION_STORAGE.removeItem('user');
};

// Clear all auth data
export const clearAllAuth = () => {
  clearAuthToken();
  clearStoredUser();
};

// Check if user is authenticated.
// NOTE: The backend currently issues no JWT — the accessToken slot holds the
// user's numeric ID as a pseudo-token so the infrastructure is ready when
// JWT is added. We consider any session with a valid stored user as authenticated.
export const isAuthenticated = () => {
  return !!getStoredUser();
};

// Check if user has specific role
export const hasRole = (role) => {
  const user = getStoredUser();
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  
  return user.role === role;
};

// Check if user has any of the allowed roles
export const hasAnyRole = (roles) => {
  return hasRole(roles);
};

// Get current user's ID
export const getCurrentUserId = () => {
  const user = getStoredUser();
  return user?.id || null;
};

// Get current user's role
export const getCurrentUserRole = () => {
  const user = getStoredUser();
  return user?.role || null;
};

// Check if user is admin
export const isAdmin = () => {
  return hasRole('Admin');
};

// Check if user is technician
export const isTechnician = () => {
  return hasRole('Technician');
};

// Check if user is employee
export const isEmployee = () => {
  return hasRole('User');
};
