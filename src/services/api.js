// API Configuration and Base Service
import { getAccessToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Generic API request handler with error handling and auth
const apiRequest = async (endpoint, options = {}) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization token if available
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.json();
        const details = errorBody?.error || errorBody?.message;
        if (details) {
          errorMessage = `${errorMessage} - ${details}`;
        }
      } catch {
        // Keep default error message if body is not JSON.
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Request Failed: ${endpoint}`, error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  // Login user
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Register new user
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get current user
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

// Equipment API
export const equipmentAPI = {
  // Get all equipment
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/equipment?${queryParams}` : '/equipment';
    return apiRequest(endpoint);
  },

  // Get single equipment
  getById: async (id) => {
    return apiRequest(`/equipment/${id}`);
  },

  // Create equipment
  create: async (data) => {
    return apiRequest('/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update equipment
  update: async (id, data) => {
    return apiRequest(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete equipment
  delete: async (id) => {
    return apiRequest(`/equipment/${id}`, {
      method: 'DELETE',
    });
  },

  // Get equipment maintenance requests
  getMaintenanceRequests: async (id) => {
    return apiRequest(`/equipment/${id}/maintenance-requests`);
  },

  // Get grouped equipment
  getGrouped: async (groupBy = 'department') => {
    return apiRequest(`/equipment/grouped?groupBy=${groupBy}`);
  },
};

// Maintenance Request API
export const maintenanceRequestAPI = {
  // Get all requests
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/maintenance-requests?${queryParams}` : '/maintenance-requests';
    return apiRequest(endpoint);
  },

  // Get single request
  getById: async (id) => {
    return apiRequest(`/maintenance-requests/${id}`);
  },

  // Create request
  create: async (data) => {
    return apiRequest('/maintenance-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update request
  update: async (id, data) => {
    return apiRequest(`/maintenance-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Update stage (for Kanban)
  updateStage: async (id, stage) => {
    return apiRequest(`/maintenance-requests/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    });
  },

  // Delete request
  delete: async (id) => {
    return apiRequest(`/maintenance-requests/${id}`, {
      method: 'DELETE',
    });
  },

  // Get Kanban view
  getKanbanView: async () => {
    return apiRequest('/maintenance-requests/kanban');
  },

  // Get Calendar view
  getCalendar: async (startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate }).toString();
    return apiRequest(`/maintenance-requests/calendar?${params}`);
  },

  // Get statistics
  getStatistics: async () => {
    return apiRequest('/maintenance-requests/statistics');
  },
};

// Team API
export const teamAPI = {
  // Get all teams
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/teams?${queryParams}` : '/teams';
    return apiRequest(endpoint);
  },

  // Get single team
  getById: async (id) => {
    return apiRequest(`/teams/${id}`);
  },

  // Create team
  create: async (data) => {
    return apiRequest('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update team
  update: async (id, data) => {
    return apiRequest(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete team
  delete: async (id) => {
    return apiRequest(`/teams/${id}`, {
      method: 'DELETE',
    });
  },

  // Add member to team
  addMember: async (teamId, userId) => {
    return apiRequest(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Remove member from team
  removeMember: async (teamId, userId) => {
    return apiRequest(`/teams/${teamId}/members`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  },
};

// User API
export const userAPI = {
  // Get all users
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/users?${queryParams}` : '/users';
    return apiRequest(endpoint);
  },

  // Get single user
  getById: async (id) => {
    return apiRequest(`/users/${id}`);
  },

  // Create user
  create: async (data) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update user
  update: async (id, data) => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete user
  delete: async (id) => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Dashboard API
export const dashboardAPI = {
  // Admin dashboard
  getAdminDashboard: async () => {
    return apiRequest('/dashboard/admin');
  },

  // Technician dashboard
  getTechnicianDashboard: async () => {
    return apiRequest('/dashboard/technician');
  },

  // Employee dashboard
  getEmployeeDashboard: async () => {
    return apiRequest('/dashboard/employee');
  },

  // Team performance
  getTeamPerformance: async () => {
    return apiRequest('/dashboard/team-performance');
  },
};

// Extended Maintenance Request API
export const maintenanceRequestExtAPI = {
  // Get my requests
  getMyRequests: async () => {
    return apiRequest('/maintenance-requests/my-requests');
  },

  // Assign technician (admin)
  assignTechnician: async (id, assignedToId, scheduledDate) => {
    return apiRequest(`/maintenance-requests/${id}/assign-technician`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedToId, scheduledDate }),
    });
  },

  // Start work (technician)
  startWork: async (id) => {
    return apiRequest(`/maintenance-requests/${id}/start-work`, {
      method: 'PATCH',
    });
  },

  // Add work notes (technician)
  addNotes: async (id, notes) => {
    return apiRequest(`/maintenance-requests/${id}/add-notes`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  },

  // Complete request (technician)
  completeRequest: async (id, actualCost, completionNotes) => {
    return apiRequest(`/maintenance-requests/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ actualCost, completionNotes }),
    });
  },

  // Rate service (employee)
  rateService: async (id, rating, feedback) => {
    return apiRequest(`/maintenance-requests/${id}/rate`, {
      method: 'PATCH',
      body: JSON.stringify({ rating, feedback }),
    });
  },
};

export default {
  auth: authAPI,
  equipment: equipmentAPI,
  maintenanceRequest: maintenanceRequestAPI,
  maintenanceRequestExt: maintenanceRequestExtAPI,
  team: teamAPI,
  user: userAPI,
  dashboard: dashboardAPI,
};
