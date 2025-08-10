// frontend/src/services/foodRequestService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return (
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('authToken') ||
    sessionStorage.getItem('token')
  );
};

// Helper function to create authenticated request config
const getRequestConfig = (additionalHeaders = {}) => {
  const token = getAuthToken();
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...additionalHeaders,
    },
  };
};

const foodRequestService = {
  // Submit a new food request
  submitRequest: async requestData => {
    const response = await axios.post(
      `${API_BASE_URL}/food-requests`,
      requestData,
      getRequestConfig()
    );
    return response.data;
  },

  // Get user's food requests
  getUserRequests: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/food-requests/my-requests${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, getRequestConfig());
    return response.data;
  },

  // Get all requests (admin/staff only)
  getAllRequests: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/food-requests${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, getRequestConfig());
    return response.data;
  },

  // Get request by ID
  getRequestById: async requestId => {
    const response = await axios.get(
      `${API_BASE_URL}/food-requests/${requestId}`,
      getRequestConfig()
    );
    return response.data;
  },

  // Update request status (admin/staff only)
  updateRequestStatus: async (requestId, status, notes = '') => {
    const response = await axios.put(
      `${API_BASE_URL}/food-requests/${requestId}/status`,
      { status, notes },
      getRequestConfig()
    );
    return response.data;
  },

  // Get request statistics
  getRequestStats: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/food-requests/stats${queryParams ? `?${queryParams}` : ''}`;

    const response = await axios.get(url, getRequestConfig());
    return response.data;
  },
};

export default foodRequestService;
