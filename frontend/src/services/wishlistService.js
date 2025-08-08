// frontend/src/services/wishlistService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Ensure auth token is attached to requests
axios.interceptors.request.use(
  config => {
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
  error => Promise.reject(error)
);

const wishlistService = {
  // Get user's wishlists
  getWishlists: async () => {
    const response = await axios.get(`${API_BASE_URL}/wishlists`);
    return response.data;
  },

  // Create new wishlist
  createWishlist: async (name, description, items = []) => {
    const response = await axios.post(`${API_BASE_URL}/wishlists`, {
      name,
      description,
      items,
    });
    return response.data;
  },

  // Load wishlist to cart
  loadToCart: async wishlistId => {
    const response = await axios.post(`${API_BASE_URL}/wishlists/${wishlistId}/load-to-cart`);
    return response.data;
  },

  // Delete wishlist
  deleteWishlist: async wishlistId => {
    const response = await axios.delete(`${API_BASE_URL}/wishlists/${wishlistId}`);
    return response.data;
  },
};

export default wishlistService;
