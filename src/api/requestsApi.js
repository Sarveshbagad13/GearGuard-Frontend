import api from './config';

// Get all maintenance requests
export const getAllRequests = async () => {
  try {
    const response = await api.get('/requests');
    return response.data;
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};

// Get single request by ID
export const getRequestById = async (id) => {
  try {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching request:', error);
    throw error;
  }
};

// Create new request
export const createRequest = async (requestData) => {
  try {
    const response = await api.post('/requests', requestData);
    return response.data;
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

// Update request
export const updateRequest = async (id, requestData) => {
  try {
    const response = await api.put(`/requests/${id}`, requestData);
    return response.data;
  } catch (error) {
    console.error('Error updating request:', error);
    throw error;
  }
};

// Delete request
export const deleteRequest = async (id) => {
  try {
    const response = await api.delete(`/requests/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting request:', error);
    throw error;
  }
};

// Update request status
export const updateRequestStatus = async (id, status) => {
  try {
    const response = await api.patch(`/requests/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
};

// Assign technician to request
export const assignTechnician = async (requestId, technicianId) => {
  try {
    const response = await api.patch(`/requests/${requestId}/assign`, { 
      technicianId 
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning technician:', error);
    throw error;
  }
};

// Export requests to CSV
export const exportRequests = async () => {
  try {
    const response = await api.get('/requests/export', {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `maintenance-requests-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response.data;
  } catch (error) {
    console.error('Error exporting requests:', error);
    throw error;
  }
};