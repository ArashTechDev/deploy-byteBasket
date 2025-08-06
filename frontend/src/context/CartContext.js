/* eslint-disable no-console */
// frontend/src/contexts/CartContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import cartService from '../services/cartService';

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
    default:
      return state;
  }
};

const initialState = {
  cart: { items: [], total_items: 0 },
  loading: false,
  error: null,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    loadCart();
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
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    }
  };

  const addToCart = async (inventoryId, quantity) => {
    try {
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

  const value = {
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    saveAsWishlist,
    clearError,
    loadCart,
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
