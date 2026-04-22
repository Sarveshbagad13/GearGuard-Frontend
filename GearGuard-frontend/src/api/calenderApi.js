import api from './config';

// Get all calendar events
export const getAllEvents = async () => {
  try {
    const response = await api.get('/calendar');
    return response.data;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

// Get events by date range
export const getEventsByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get('/calendar/range', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events by date range:', error);
    throw error;
  }
};

// Get single event by ID
export const getEventById = async (id) => {
  try {
    const response = await api.get(`/calendar/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

// Create new event
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/calendar', eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update event
export const updateEvent = async (id, eventData) => {
  try {
    const response = await api.put(`/calendar/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete event
export const deleteEvent = async (id) => {
  try {
    const response = await api.delete(`/calendar/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Update event status
export const updateEventStatus = async (id, status) => {
  try {
    const response = await api.patch(`/calendar/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating event status:', error);
    throw error;
  }
};

// Export calendar events to CSV
export const exportEvents = async () => {
  try {
    const response = await api.get('/calendar/export', {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `maintenance-schedule-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response.data;
  } catch (error) {
    console.error('Error exporting events:', error);
    throw error;
  }
};