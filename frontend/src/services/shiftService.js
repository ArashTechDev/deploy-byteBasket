// frontend/src/services/shiftService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken') || '';
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Shift Service
export const shiftService = {
  // Get all shifts for a foodbank
  getShifts: async (foodbankId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/shifts/foodbank/${foodbankId}${queryParams ? `?${queryParams}` : ''}`;
    return apiCall(endpoint);
  },

  // Get upcoming shifts
  getUpcomingShifts: async (foodbankId) => {
    return apiCall(`/shifts/upcoming/foodbank/${foodbankId}`);
  },

  // Get available shifts (not full)
  getAvailableShifts: async (foodbankId) => {
    return apiCall(`/shifts/available/foodbank/${foodbankId}`);
  },

  // Get shifts by date range
  getShiftsByDateRange: async (foodbankId, startDate, endDate) => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    }).toString();
    return apiCall(`/shifts/foodbank/${foodbankId}/date-range?${params}`);
  },

  // Get a specific shift
  getShift: async (shiftId) => {
    return apiCall(`/shifts/${shiftId}`);
  },

  // Create a new shift
  createShift: async (shiftData) => {
    return apiCall('/shifts', {
      method: 'POST',
      body: JSON.stringify(shiftData),
    });
  },

  // Update a shift
  updateShift: async (shiftId, updateData) => {
    return apiCall(`/shifts/${shiftId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Delete a shift
  deleteShift: async (shiftId) => {
    return apiCall(`/shifts/${shiftId}`, {
      method: 'DELETE',
    });
  },

  // Update shift status
  updateShiftStatus: async (shiftId, status) => {
    return apiCall(`/shifts/${shiftId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Helper function to transform shift data for calendar display
  transformShiftsForCalendar: (shifts) => {
    if (!Array.isArray(shifts) || shifts.length === 0) {
      // Provide a richer mock fallback when backend has no data
      const today = new Date();
      const day = 24 * 60 * 60 * 1000;
      const fmt = d => new Date(d).toISOString().split('T')[0];
      const mock = [
        { id: 'mock-a', date: fmt(today.getTime() + 1 * day), time: '09:00 AM - 12:00 PM', activity: 'Food Sorting', spotsAvailable: 3, totalSpots: 6, location: 'Main Warehouse', status: 'published' },
        { id: 'mock-b', date: fmt(today.getTime() + 1 * day), time: '01:00 PM - 04:00 PM', activity: 'Packaging', spotsAvailable: 2, totalSpots: 5, location: 'Packaging Area', status: 'published' },
        { id: 'mock-c', date: fmt(today.getTime() + 2 * day), time: '10:00 AM - 01:00 PM', activity: 'Inventory Management', spotsAvailable: 4, totalSpots: 6, location: 'Storage Room', status: 'published' },
        { id: 'mock-d', date: fmt(today.getTime() + 3 * day), time: '02:00 PM - 05:00 PM', activity: 'Food Distribution', spotsAvailable: 1, totalSpots: 4, location: 'Community Center', status: 'published' },
        { id: 'mock-e', date: fmt(today.getTime() + 4 * day), time: '09:00 AM - 12:00 PM', activity: 'Donation Intake', spotsAvailable: 5, totalSpots: 8, location: 'Front Desk', status: 'published' },
        { id: 'mock-f', date: fmt(today.getTime() + 5 * day), time: '11:00 AM - 02:00 PM', activity: 'Admin Support', spotsAvailable: 3, totalSpots: 5, location: 'Main Office', status: 'published' },
      ];
      return mock;
    }

    return shifts.map(shift => ({
      id: shift._id,
      date: new Date(shift.shift_date).toISOString().split('T')[0], // Format: YYYY-MM-DD
      time: `${shift.start_time} - ${shift.end_time}`,
      activity: shift.title,
      spotsAvailable: shift.available_spots || (shift.capacity - shift.current_volunteers),
      totalSpots: shift.capacity,
      location: shift.location,
      description: shift.description,
      category: shift.activity_category,
      status: shift.status
    }));
  },

  // Helper function to get shifts for a specific date
  getShiftsForDate: (shifts, dateString) => {
    return shifts.filter(shift => shift.date === dateString);
  }
};

export default shiftService;