/**
 * Role-Based Access Control Helper
 * Define what each role can do in the system
 */

export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  TECHNICIAN: 'Technician',
  USER: 'User'
};

export const PERMISSIONS = {
  // Equipment permissions
  VIEW_ALL_EQUIPMENT: [ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN],
  CREATE_EQUIPMENT: [ROLES.ADMIN, ROLES.MANAGER],
  UPDATE_EQUIPMENT: [ROLES.ADMIN, ROLES.MANAGER],
  DELETE_EQUIPMENT: [ROLES.ADMIN],
  
  // Maintenance Request permissions
  VIEW_ALL_REQUESTS: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_ASSIGNED_REQUESTS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN],
  CREATE_REQUEST: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
  ASSIGN_TECHNICIAN: [ROLES.ADMIN, ROLES.MANAGER],
  UPDATE_REQUEST_STATUS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN],
  DELETE_REQUEST: [ROLES.ADMIN],
  
  // Team permissions
  VIEW_TEAMS: [ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_TEAMS: [ROLES.ADMIN, ROLES.MANAGER],
  
  // Calendar permissions
  VIEW_CALENDAR: [ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN],
  SCHEDULE_MAINTENANCE: [ROLES.ADMIN, ROLES.MANAGER],
  
  // Kanban board permissions
  VIEW_KANBAN: [ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN],
  MANAGE_KANBAN: [ROLES.ADMIN, ROLES.MANAGER],
  
  // User management permissions
  VIEW_USERS: [ROLES.ADMIN, ROLES.MANAGER],
  MANAGE_USERS: [ROLES.ADMIN]
};

/**
 * Check if a user has a specific permission
 * @param {string} userRole - The user's role
 * @param {string} permission - The permission key from PERMISSIONS
 * @returns {boolean} - Whether the user has the permission
 */
export const hasPermission = (userRole, permission) => {
  if (Array.isArray(permission)) {
    return permission.some((entry) => hasPermission(userRole, entry));
  }

  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) {
    console.warn(`Permission "${permission}" is not defined`);
    return false;
  }
  return allowedRoles.includes(userRole);
};

/**
 * Get role description
 */
export const getRoleDescription = (role) => {
  const descriptions = {
    [ROLES.ADMIN]: 'Full system access - Manage everything',
    [ROLES.MANAGER]: 'Team management and request oversight',
    [ROLES.TECHNICIAN]: 'Handle assigned maintenance tasks',
    [ROLES.USER]: 'Create and track maintenance requests'
  };
  return descriptions[role] || 'Unknown Role';
};

/**
 * Get role color for UI
 */
export const getRoleColor = (role) => {
  const colors = {
    [ROLES.ADMIN]: 'text-red-400 bg-red-500/10 border-red-500/30',
    [ROLES.MANAGER]: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    [ROLES.TECHNICIAN]: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    [ROLES.USER]: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
  };
  return colors[role] || 'text-gray-400 bg-gray-500/10 border-gray-500/30';
};
