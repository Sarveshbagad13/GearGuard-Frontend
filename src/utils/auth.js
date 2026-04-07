export const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return 'User';

  const normalized = role.trim().toLowerCase();
  const roleMap = {
    admin: 'Admin',
    manager: 'Manager',
    technician: 'Technician',
    user: 'User',
  };

  return roleMap[normalized] || 'User';
};

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
