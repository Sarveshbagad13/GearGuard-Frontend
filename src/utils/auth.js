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
export const setAuthToken = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

export const clearAuthToken = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// User management
export const getStoredUser = () => {
  const rawUser = localStorage.getItem('user');

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

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify({
      ...user,
      role: normalizeRole(user.role),
    }));
  }
};

export const clearStoredUser = () => {
  localStorage.removeItem('user');
};

// Clear all auth data
export const clearAllAuth = () => {
  clearAuthToken();
  clearStoredUser();
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAccessToken() && !!getStoredUser();
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
