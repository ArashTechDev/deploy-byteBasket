import axios from 'axios';

const API = 'http://localhost:5000/api/auth';

// Add axios interceptor to handle token expiration
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear token on authentication failures
      localStorage.removeItem('token');
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
      // Store token on successful login
      localStorage.setItem('token', res.data.token);
    }
    return res.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const res = await axios.post(`${API}/logout`);
    // Clear token regardless of server response
    localStorage.removeItem('token');
    return res.data;
  } catch (error) {
    // Still clear token even if server call fails
    localStorage.removeItem('token');
    console.error('Logout error:', error.response?.data || error.message);
    throw error;
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
    const token = localStorage.getItem('token');
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

    // If token is invalid, remove it
    if (error.response?.status === 401 || error.response?.status === 500) {
      console.log('Removing invalid token');
      localStorage.removeItem('token');
    }

    throw error;
  }
};

export const getDashboard = async () => {
  try {
    const token = localStorage.getItem('token');
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

    // If token is invalid, remove it
    if (error.response?.status === 401 || error.response?.status === 500) {
      localStorage.removeItem('token');
    }

    throw error;
  }
};
