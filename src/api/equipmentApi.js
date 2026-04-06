import api from './config';

// Get all equipment
export const getAllEquipment = async (filters = {}) => {
  try {
    const params = {};
    
    // Add filters if provided
    if (filters.department) params.department = filters.department;
    if (filters.category) params.category = filters.category;
    if (filters.status) params.status = filters.status;
    if (filters.ownershipType) params.ownershipType = filters.ownershipType;
    
    const response = await api.get('/equipment', { params });
    
    // Backend returns: { success: true, count: X, data: [...] }
    return response.data.data; // Extract the array
  } catch (error) {
    console.error('Error fetching equipment:', error);
    throw error;
  }
};

// Get equipment grouped by department or employee
export const getEquipmentGrouped = async (groupBy = 'department') => {
  try {
    const response = await api.get('/equipment/grouped', {
      params: { groupBy } // 'department' or 'employee'
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching grouped equipment:', error);
    throw error;
  }
};

// Get single equipment by ID
export const getEquipmentById = async (id) => {
  try {
    const response = await api.get(`/equipment/${id}`);
    
    // Backend returns: { success: true, data: {...} }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching equipment:', error);
    throw error;
  }
};

// Get maintenance requests for specific equipment
export const getEquipmentMaintenanceRequests = async (id, status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await api.get(`/equipment/${id}/maintenance-requests`, { params });
    
    // Backend returns: { success: true, count: X, openCount: Y, data: [...] }
    return response.data;
  } catch (error) {
    console.error('Error fetching equipment maintenance requests:', error);
    throw error;
  }
};

// Create new equipment
export const createEquipment = async (equipmentData) => {
  try {
    const response = await api.post('/equipment', equipmentData);
    
    // Backend returns: { success: true, message: "...", data: {...} }
    return response.data.data;
  } catch (error) {
    console.error('Error creating equipment:', error);
    // Re-throw with message from backend if available
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

// Update equipment
export const updateEquipment = async (id, equipmentData) => {
  try {
    const response = await api.put(`/equipment/${id}`, equipmentData);
    
    // Backend returns: { success: true, message: "...", data: {...} }
    return response.data.data;
  } catch (error) {
    console.error('Error updating equipment:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

// Delete equipment (soft delete)
export const deleteEquipment = async (id) => {
  try {
    const response = await api.delete(`/equipment/${id}`);
    
    // Backend returns: { success: true, message: "Equipment deleted successfully" }
    return response.data;
  } catch (error) {
    console.error('Error deleting equipment:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

// Export equipment to CSV (if backend supports it)
export const exportEquipment = async () => {
  try {
    // Try to get export endpoint from backend
    const response = await api.get('/equipment/export', {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `equipment-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    // If backend doesn't have export endpoint, create CSV from frontend
    console.warn('Backend export not available, creating CSV from frontend');
    
    // Fallback: Get all equipment and create CSV manually
    const equipment = await getAllEquipment();
    const headers = ['ID', 'Name', 'Serial Number', 'Category', 'Location', 'Status', 'Department'];
    const rows = equipment.map(eq => [
      eq.id,
      eq.name,
      eq.serialNumber,
      eq.category,
      eq.location,
      eq.status,
      eq.department || 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `equipment-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  }
};

// Import equipment from CSV (if backend supports it)
export const importEquipment = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/equipment/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error importing equipment:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};