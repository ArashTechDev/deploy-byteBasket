import axios from 'axios';

class AuthService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.authEndpoint = `${this.baseURL}/auth`;

    // Automatically attach token to axios requests
    axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });
  }

  async login(credentials, navigate) {
    try {
      const response = await axios.post(`${this.authEndpoint}/login`, credentials);
      const data = response.data;

      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Redirect based on role
      if (navigate && data.user) {
        const role = data.user.role?.toLowerCase();
        if (role === 'admin') {
          navigate('/dashboard');
        } else if (role === 'staff') {
          navigate('/inventory');
        } else {
          console.warn(`Unknown role: ${role}`);
        }
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Login failed';
      throw new Error(message);
    }
  }

  async register(userData) {
    try {
      const response = await axios.post(`${this.authEndpoint}/register`, userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Registration failed';
      throw new Error(message);
    }
  }

  async logout() {
    try {
      await axios.post(`${this.authEndpoint}/logout`);
    } catch (error) {
      console.warn('Server-side logout failed:', error);
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  async verifyEmail(token) {
    try {
      const response = await axios.get(`${this.authEndpoint}/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      throw new Error('Email verification failed');
    }
  }

  async getDashboard() {
    try {
      const response = await axios.get(`${this.authEndpoint}/dashboard`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch dashboard data');
    }
  }

  async getCurrentUserRemote() {
    try {
      const response = await axios.get(`${this.authEndpoint}/me`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch current user');
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  getToken() {
    return localStorage.getItem('authToken');
  }
}

const authService = new AuthService();
export default authService;
