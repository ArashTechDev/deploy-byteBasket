// frontend/src/services/cartService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const cartService = {
  // Get user's cart
  getCart: async () => {
    const response = await axios.get(`${API_BASE_URL}/cart`);
    return response.data;
  },

  // Add item to cart
  addToCart: async (inventoryId, quantity) => {
    const response = await axios.post(`${API_BASE_URL}/cart/add`, {
      inventory_id: inventoryId,
      quantity,
    });
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    const response = await axios.put(`${API_BASE_URL}/cart/items/${itemId}`, {
      quantity,
    });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async itemId => {
    const response = await axios.delete(`${API_BASE_URL}/cart/items/${itemId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await axios.delete(`${API_BASE_URL}/cart/clear`);
    return response.data;
  },

  // Save cart as wishlist
  saveAsWishlist: async (name, description) => {
    const response = await axios.post(`${API_BASE_URL}/cart/save-wishlist`, {
      name,
      description,
    });
    return response.data;
  },
};

export default cartService;
