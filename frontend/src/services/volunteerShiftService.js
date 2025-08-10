// frontend/src/services/volunteerShiftService.js

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

// Volunteer Shift Service
export const volunteerShiftService = {
  // Assign volunteer to a shift
  assignVolunteerToShift: async (assignmentData) => {
    return apiCall('/volunteer-shifts', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  },

  // Get volunteer shifts by volunteer ID
  getVolunteerShifts: async (volunteerId, startDate = null, endDate = null) => {
    let endpoint = `/volunteer-shifts/volunteer/${volunteerId}`;
    if (startDate && endDate) {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      }).toString();
      endpoint += `?${params}`;
    }
    return apiCall(endpoint);
  },

  // Get shifts by shift ID (all volunteers assigned)
  getShiftVolunteers: async (shiftId) => {
    return apiCall(`/volunteer-shifts/shift/${shiftId}`);
  },

  // Get volunteer shifts by user ID
  getUserShifts: async (userId, startDate = null, endDate = null) => {
    let endpoint = `/volunteer-shifts/user/${userId}`;
    if (startDate && endDate) {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      }).toString();
      endpoint += `?${params}`;
    }
    return apiCall(endpoint);
  },

  // Update volunteer shift status
  updateShiftStatus: async (volunteerShiftId, status, additionalData = {}) => {
    return apiCall(`/volunteer-shifts/${volunteerShiftId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...additionalData }),
    });
  },

  // Cancel volunteer shift
  cancelVolunteerShift: async (volunteerShiftId, reason, cancelledBy) => {
    return apiCall(`/volunteer-shifts/${volunteerShiftId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({
        cancelled_reason: reason,
        cancelled_by: cancelledBy,
      }),
    });
  },

  // Check in volunteer
  checkInVolunteer: async (volunteerShiftId, checkInTime = null) => {
    return apiCall(`/volunteer-shifts/${volunteerShiftId}/check-in`, {
      method: 'PATCH',
      body: JSON.stringify({
        check_in_time: checkInTime || new Date().toTimeString().slice(0, 5),
      }),
    });
  },

  // Check out volunteer
  checkOutVolunteer: async (volunteerShiftId, checkOutTime = null) => {
    return apiCall(`/volunteer-shifts/${volunteerShiftId}/check-out`, {
      method: 'PATCH',
      body: JSON.stringify({
        check_out_time: checkOutTime || new Date().toTimeString().slice(0, 5),
      }),
    });
  },

  // Complete volunteer shift
  completeVolunteerShift: async (volunteerShiftId, feedback = {}) => {
    return apiCall(`/volunteer-shifts/${volunteerShiftId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({
        feedback,
      }),
    });
  },

  // Get volunteer hours summary
  getVolunteerHours: async (volunteerId, startDate = null, endDate = null) => {
    let endpoint = `/volunteer-shifts/volunteer/${volunteerId}/hours`;
    if (startDate && endDate) {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      }).toString();
      endpoint += `?${params}`;
    }
    return apiCall(endpoint);
  },

  // Get foodbank volunteer hours summary
  getFoodbankVolunteerHours: async (foodbankId, startDate = null, endDate = null) => {
    let endpoint = `/volunteer-shifts/foodbank/${foodbankId}/hours`;
    if (startDate && endDate) {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      }).toString();
      endpoint += `?${params}`;
    }
    return apiCall(endpoint);
  },

  // Helper function to transform volunteer shifts for frontend display
  transformVolunteerShifts: (volunteerShifts) => {
    return (volunteerShifts || []).map(vs => {
      const shift = vs.shift_id || {};
      const workDate = vs.work_date || shift.shift_date;
      return {
        id: vs._id,
        shiftId: shift && shift._id ? shift._id : vs.shift_id,
        date: workDate ? new Date(workDate).toISOString().split('T')[0] : '',
        time: shift && shift.start_time && shift.end_time ? `${shift.start_time} - ${shift.end_time}` : 'Time TBD',
        activity: shift && shift.title ? shift.title : 'Activity TBD',
        location: shift && shift.location ? shift.location : 'Location TBD',
        hours: typeof vs.hours_worked === 'number' ? vs.hours_worked : (shift && typeof shift.duration_hours === 'number' ? shift.duration_hours : 0),
        status: vs.status,
        checkInTime: vs.check_in_time,
        checkOutTime: vs.check_out_time,
        feedback: vs.feedback,
        isCompleted: vs.status === 'completed',
        isActive: ['assigned', 'confirmed', 'checked_in'].includes(vs.status),
        assignmentDate: vs.assignment_date,
        workDate: vs.work_date
      };
    });
  },

  // Helper function to create shift assignment data
  createShiftAssignment: (volunteerId, shiftId, userId, foodbankId) => {
    return {
      volunteer_id: volunteerId,
      shift_id: shiftId,
      user_id: userId,
      foodbank_id: foodbankId,
      work_date: new Date().toISOString().split('T')[0], // This should be the actual shift date
      status: 'assigned'
    };
  }
};

export default volunteerShiftService;