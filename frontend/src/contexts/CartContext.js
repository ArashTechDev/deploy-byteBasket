/* eslint-disable no-console */
// frontend/src/contexts/CartContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import cartService from '../services/cartService';
import { getCurrentUser } from '../services/authService';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'ADD_TO_CART':
      return { ...state, cart: action.payload };
    case 'UPDATE_CART':
      return { ...state, cart: action.payload };
    case 'CLEAR_CART':
      return { ...state, cart: { ...state.cart, items: [], total_items: 0 } };
    case 'SET_USER_AUTHENTICATED':
      return { ...state, isUserAuthenticated: action.payload };
    default:
      return state;
  }
};

const initialState = {
  cart: { items: [], total_items: 0 },
  loading: false,
  error: null,
  isUserAuthenticated: false,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Check authentication first, then load cart
  useEffect(() => {
    const initializeCart = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, user not authenticated');
          dispatch({ type: 'SET_USER_AUTHENTICATED', payload: false });
          return;
        }

        // Verify user authentication
        const userResponse = await getCurrentUser();
        if (userResponse && userResponse.success) {
          dispatch({ type: 'SET_USER_AUTHENTICATED', payload: true });

          // Only load cart after confirming authentication
          await loadCart();
        } else {
          dispatch({ type: 'SET_USER_AUTHENTICATED', payload: false });
        }
      } catch (error) {
        console.log('User authentication failed, skipping cart load:', error.message);
        dispatch({ type: 'SET_USER_AUTHENTICATED', payload: false });

        // Clear token if it's invalid
        if (error.response?.status === 401 || error.response?.status === 500) {
          localStorage.removeItem('token');
        }
      }
    };

    initializeCart();
  }, []);

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartService.getCart();
      if (response.success) {
        dispatch({ type: 'SET_CART', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to load cart:', error);

      // Don't set error for authentication issues - just fail silently
      if (error.response?.status === 401) {
        console.log('Cart loading failed due to authentication');
        dispatch({ type: 'SET_USER_AUTHENTICATED', payload: false });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (inventoryId, quantity) => {
    try {
      if (!state.isUserAuthenticated) {
        return { success: false, message: 'Please log in to add items to cart' };
      }

      const response = await cartService.addToCart(inventoryId, quantity);
      if (response.success) {
        dispatch({ type: 'ADD_TO_CART', payload: response.data });
        return { success: true, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, message };
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      if (!state.isUserAuthenticated) {
        return { success: false, message: 'Please log in to update cart' };
      }

      const response = await cartService.updateCartItem(itemId, quantity);
      if (response.success) {
        dispatch({ type: 'UPDATE_CART', payload: response.data });
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart item';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, message };
    }
  };

  const removeFromCart = async itemId => {
    try {
      if (!state.isUserAuthenticated) {
        return { success: false, message: 'Please log in to remove items from cart' };
      }

      const response = await cartService.removeFromCart(itemId);
      if (response.success) {
        dispatch({ type: 'UPDATE_CART', payload: response.data });
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item from cart';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, message };
    }
  };

  const clearCart = async () => {
    try {
      if (!state.isUserAuthenticated) {
        return { success: false, message: 'Please log in to clear cart' };
      }

      const response = await cartService.clearCart();
      if (response.success) {
        dispatch({ type: 'CLEAR_CART' });
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, message };
    }
  };

  const saveAsWishlist = async (name, description) => {
    try {
      if (!state.isUserAuthenticated) {
        return { success: false, message: 'Please log in to save wishlist' };
      }

      const response = await cartService.saveAsWishlist(name, description);
      if (response.success) {
        return { success: true, data: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save wishlist';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Method to manually refresh cart after login
  const refreshCart = async () => {
    // After login, token is stored but isUserAuthenticated may still be false
    // Sync auth state from storage, then load cart
    const token =
      localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('authToken') ||
      sessionStorage.getItem('token');

    if (!token) {
      dispatch({ type: 'SET_USER_AUTHENTICATED', payload: false });
      return;
    }

    dispatch({ type: 'SET_USER_AUTHENTICATED', payload: true });
    await loadCart();
  };

  const value = {
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    isUserAuthenticated: state.isUserAuthenticated,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    saveAsWishlist,
    clearError,
    loadCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
