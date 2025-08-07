// frontend/src/services/inventoryService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Add request interceptor to include auth token - FIXED TOKEN KEY
axios.interceptors.request.use(
  config => {
    // Try multiple token keys for compatibility
    const token =
      localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('authToken') ||
      sessionStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

const inventoryService = {
  // Get all inventory items (main method used by hooks) - FIXED RESPONSE HANDLING
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();

    // Add all filter parameters
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.dietary_category) params.append('dietary_category', filters.dietary_category);
    if (filters.foodbank_id) params.append('foodbank_id', filters.foodbank_id);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.low_stock) params.append('low_stock', filters.low_stock);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    try {
      const response = await axios.get(`${API_BASE_URL}/inventory?${params}`);

      // Handle different response structures from backend
      const responseData = response.data;

      if (responseData.success) {
        // Backend returns { success: true, data: [...], pagination: {...} }
        return {
          items: responseData.data || [],
          pagination: responseData.pagination || {},
        };
      } else {
        // Fallback for direct array response
        return {
          items: Array.isArray(responseData) ? responseData : [],
          pagination: {},
        };
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);

      // Log more details for debugging
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }

      throw new Error(error.response?.data?.message || 'Failed to fetch inventory');
    }
  },

  // Create new inventory item
  create: async itemData => {
    try {
      const response = await axios.post(`${API_BASE_URL}/inventory`, itemData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw new Error(error.response?.data?.message || 'Failed to create inventory item');
    }
  },

  // Update inventory item
  update: async (id, itemData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/inventory/${id}`, itemData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw new Error(error.response?.data?.message || 'Failed to update inventory item');
    }
  },

  // Delete inventory item
  delete: async id => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete inventory item');
    }
  },

  // Get single inventory item
  getInventoryItem: async id => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch inventory item');
    }
  },

  // Get low stock alerts
  getLowStockAlerts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory/alerts/low-stock`);
      return response.data.data || response.data.items || [];
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch low stock alerts');
    }
  },

  // Get expiring items alerts
  getExpiringAlerts: async (days = 7) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory/alerts/expiring?days=${days}`);
      return response.data.data || response.data.items || [];
    } catch (error) {
      console.error('Error fetching expiring alerts:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch expiring alerts');
    }
  },

  // Get inventory statistics
  getStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory/stats`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch inventory statistics');
    }
  },

  // Get available categories
  getCategories: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory/meta/categories`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get dietary categories
  getDietaryCategories: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory/meta/dietary-categories`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching dietary categories:', error);
      return ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 'low_sodium'];
    }
  },
};

export default inventoryService;
