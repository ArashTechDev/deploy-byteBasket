// frontend/src/services/cartService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token (supporting multiple token keys for compatibility)
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

const cartService = {
  // Get user's cart
  getCart: async () => {
    const response = await axios.get(`${API_BASE_URL}/cart`, getRequestConfig());
    return response.data;
  },

  // Add item to cart
  addToCart: async (inventoryId, quantity) => {
    const response = await axios.post(
      `${API_BASE_URL}/cart/add`,
      {
        inventory_id: inventoryId,
        quantity,
      },
      getRequestConfig()
    );
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    const response = await axios.put(
      `${API_BASE_URL}/cart/items/${itemId}`,
      {
        quantity,
      },
      getRequestConfig()
    );
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async itemId => {
    const response = await axios.delete(`${API_BASE_URL}/cart/items/${itemId}`, getRequestConfig());
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await axios.delete(`${API_BASE_URL}/cart/clear`, getRequestConfig());
    return response.data;
  },

  // Save cart as wishlist
  saveAsWishlist: async (name, description) => {
    const response = await axios.post(
      `${API_BASE_URL}/cart/save-wishlist`,
      {
        name,
        description,
      },
      getRequestConfig()
    );
    return response.data;
  },
};

export default cartService;
