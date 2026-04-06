import api from './config';

// Get all team members
export const getAllTeamMembers = async () => {
  try {
    const response = await api.get('/teams');
    return response.data;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
};

// Get single team member by ID
export const getTeamMemberById = async (id) => {
  try {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team member:', error);
    throw error;
  }
};

// Add new team member
export const addTeamMember = async (memberData) => {
  try {
    const response = await api.post('/teams', memberData);
    return response.data;
  } catch (error) {
    console.error('Error adding team member:', error);
    throw error;
  }
};

// Update team member
export const updateTeamMember = async (id, memberData) => {
  try {
    const response = await api.put(`/teams/${id}`, memberData);
    return response.data;
  } catch (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
};

// Delete team member
export const deleteTeamMember = async (id) => {
  try {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
};

// Update team member status
export const updateMemberStatus = async (id, status) => {
  try {
    const response = await api.patch(`/teams/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating member status:', error);
    throw error;
  }
};

// Export team members to CSV
export const exportTeamMembers = async () => {
  try {
    const response = await api.get('/teams/export', {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `team-members-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response.data;
  } catch (error) {
    console.error('Error exporting team members:', error);
    throw error;
  }
};