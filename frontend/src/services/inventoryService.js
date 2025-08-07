// frontend/src/services/inventoryService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Add request interceptor to include auth token
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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
  // Get all inventory items (main method used by hooks)
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
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch inventory');
    }
  },

  // Get inventory with filtering (legacy method for compatibility)
  getInventory: async (filters = {}) => {
    return await inventoryService.getAll(filters);
  },

  // Get single inventory item
  getInventoryItem: async id => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch inventory item');
    }
  },

  // Create inventory item (admin/staff only)
  create: async itemData => {
    try {
      const response = await axios.post(`${API_BASE_URL}/inventory`, itemData);
      return response.data;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw new Error(error.response?.data?.message || 'Failed to create inventory item');
    }
  },

  // Legacy method for compatibility
  createInventoryItem: async itemData => {
    return await inventoryService.create(itemData);
  },

  // Update inventory item (admin/staff only)
  update: async (id, itemData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/inventory/${id}`, itemData);
      return response.data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw new Error(error.response?.data?.message || 'Failed to update inventory item');
    }
  },

  // Legacy method for compatibility
  updateInventoryItem: async (id, itemData) => {
    return await inventoryService.update(id, itemData);
  },

  // Delete inventory item (admin/staff only)
  delete: async id => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete inventory item');
    }
  },

  // Legacy method for compatibility
  deleteInventoryItem: async id => {
    return await inventoryService.delete(id);
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
      // Return empty array as fallback
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
      // Return default dietary categories as fallback
      return {
        success: true,
        data: ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 'low_sodium'],
      };
    }
  },
};

export default inventoryService;
