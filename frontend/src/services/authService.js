// frontend/src/services/authService.js
import axios from 'axios';

const API = 'http://localhost:3001/api/auth';

// Consistent token key - using 'authToken' throughout the app
const TOKEN_KEY = 'authToken';

// Add axios interceptor to handle token expiration
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear both token keys on authentication failures for compatibility
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export const registerUser = async userData => {
  try {
    const res = await axios.post(`${API}/register`, userData);
    return res.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

export const loginUser = async credentials => {
  try {
    const res = await axios.post(`${API}/login`, credentials);
    if (res.data.success && res.data.token) {
      // Store token with consistent key
      localStorage.setItem(TOKEN_KEY, res.data.token);
      // Also store with 'token' key for backward compatibility
      localStorage.setItem('token', res.data.token);
      console.log('Token stored successfully with keys: authToken, token');
    }
    return res.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Get token before making request
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');

    if (token) {
      const res = await axios.post(
        `${API}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    // Clear all tokens regardless of server response
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');

    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    // Still clear tokens even if server call fails
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');

    console.error('Logout error:', error.response?.data || error.message);
    // Don't throw error on logout - user should be logged out regardless
    return { success: true, message: 'Logged out locally' };
  }
};

export const verifyEmail = async token => {
  try {
    const res = await axios.get(`${API}/verify-email?token=${token}`);
    return res.data;
  } catch (error) {
    console.error('Email verification error:', error.response?.data || error.message);
    throw error;
  }
};

export const resendVerificationEmail = async email => {
  try {
    const res = await axios.post(`${API}/resend-verification`, { email });
    return res.data;
  } catch (error) {
    console.error('Resend verification error:', error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    // Try both token keys for compatibility
    const token =
      localStorage.getItem(TOKEN_KEY) ||
      localStorage.getItem('token') ||
      sessionStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem('token');

    console.log('getCurrentUser called, token exists:', !!token);

    if (!token) {
      const error = new Error('No authentication token found');
      error.response = { status: 401 };
      throw error;
    }

    console.log('Making request to /me endpoint');
    const res = await axios.get(`${API}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('getCurrentUser response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Get current user error:', error.response?.data || error.message);

    // If token is invalid, remove all tokens
    if (error.response?.status === 401 || error.response?.status === 500) {
      console.log('Removing invalid tokens');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
    }

    throw error;
  }
};

export const getDashboard = async () => {
  try {
    const token =
      localStorage.getItem(TOKEN_KEY) ||
      localStorage.getItem('token') ||
      sessionStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem('token');

    if (!token) {
      const error = new Error('No authentication token found');
      error.response = { status: 401 };
      throw error;
    }

    const res = await axios.get(`${API}/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Dashboard error:', error.response?.data || error.message);

    // If token is invalid, remove all tokens
    if (error.response?.status === 401 || error.response?.status === 500) {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
    }

    throw error;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token =
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem('token') ||
    sessionStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem('token');
  return !!token;
};

// Helper function to get current token
export const getToken = () => {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem('token') ||
    sessionStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem('token')
  );
};

// Helper function to clear all authentication data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('authToken');
  // Clear any other auth-related data
  localStorage.removeItem('volunteerRegistered');
  localStorage.removeItem('volunteerName');
};
