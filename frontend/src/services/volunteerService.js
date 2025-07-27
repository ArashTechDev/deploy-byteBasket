// frontend/src/services/volunteerService.js

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

// Volunteer Service
export const volunteerService = {
  // Create a new volunteer registration
  createVolunteer: async (volunteerData) => {
    return apiCall('/volunteers', {
      method: 'POST',
      body: JSON.stringify(volunteerData),
    });
  },

  // Get all volunteers for a foodbank
  getVolunteers: async (foodbankId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/volunteers/foodbank/${foodbankId}${queryParams ? `?${queryParams}` : ''}`;
    return apiCall(endpoint);
  },

  // Get a specific volunteer
  getVolunteer: async (volunteerId) => {
    return apiCall(`/volunteers/${volunteerId}`);
  },

  // Update volunteer information
  updateVolunteer: async (volunteerId, updateData) => {
    return apiCall(`/volunteers/${volunteerId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Update volunteer status
  updateVolunteerStatus: async (volunteerId, status) => {
    return apiCall(`/volunteers/${volunteerId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Delete volunteer
  deleteVolunteer: async (volunteerId) => {
    return apiCall(`/volunteers/${volunteerId}`, {
      method: 'DELETE',
    });
  },

  // Get available volunteers for a shift
  getAvailableVolunteers: async (foodbankId, dayOfWeek, shiftTime) => {
    const params = new URLSearchParams({
      foodbank_id: foodbankId,
      day_of_week: dayOfWeek,
      shift_time: shiftTime,
    }).toString();
    return apiCall(`/volunteers/available?${params}`);
  },

  // Get volunteer statistics
  getVolunteerStats: async (foodbankId) => {
    return apiCall(`/volunteers/stats/foodbank/${foodbankId}`);
  },

  // Helper function to transform frontend form data to backend format
  transformRegistrationData: (formData) => {
    return {
      user_id: formData.user_id, // This should be set based on authentication
      foodbank_id: formData.foodbank_id, // This should be set based on context
      skills: formData.skills.map(skill => ({
        skill_name: skill,
        proficiency: 'beginner' // Default proficiency
      })),
      availability: {
        days_of_week: formData.availability.map(slot => {
          // Transform "Monday Morning" to "monday"
          return slot.split(' ')[0].toLowerCase();
        }),
        preferred_shifts: formData.availability.map(slot => {
          // Transform "Monday Morning" to "morning"
          const time = slot.split(' ')[1].toLowerCase();
          return time;
        }),
        max_hours_per_week: 40 // Default value
      },
      emergency_contact: {
        name: formData.emergencyContact,
        phone: formData.emergencyPhone,
        relationship: 'Emergency Contact' // Default relationship
      },
      notes: `Registration notes: Experience: ${formData.experience || 'None provided'}. Motivation: ${formData.motivation || 'None provided'}.`
    };
  }
};

export default volunteerService;