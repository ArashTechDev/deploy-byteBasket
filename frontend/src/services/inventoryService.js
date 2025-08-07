import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const inventoryService = {
  // Get inventory with filtering
  getInventory: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.dietary_category) params.append('dietary_category', filters.dietary_category);
    if (filters.foodbank_id) params.append('foodbank_id', filters.foodbank_id);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.low_stock) params.append('low_stock', filters.low_stock);

    const response = await axios.get(`${API_BASE_URL}/inventory?${params}`);
    return response.data;
  },

  // Get single inventory item
  getInventoryItem: async id => {
    const response = await axios.get(`${API_BASE_URL}/inventory/${id}`);
    return response.data;
  },

  // Create inventory item (admin/staff only)
  createInventoryItem: async itemData => {
    const response = await axios.post(`${API_BASE_URL}/inventory`, itemData);
    return response.data;
  },

  // Update inventory item (admin/staff only)
  updateInventoryItem: async (id, itemData) => {
    const response = await axios.put(`${API_BASE_URL}/inventory/${id}`, itemData);
    return response.data;
  },

  // Delete inventory item (admin/staff only)
  deleteInventoryItem: async id => {
    const response = await axios.delete(`${API_BASE_URL}/inventory/${id}`);
    return response.data;
  },

  // Get available categories
  getCategories: async () => {
    const response = await axios.get(`${API_BASE_URL}/inventory/meta/categories`);
    return response.data;
  },

  // Get dietary categories
  getDietaryCategories: async () => {
    return {
      success: true,
      data: ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 'low_sodium'],
    };
  },
};

export default inventoryService;
