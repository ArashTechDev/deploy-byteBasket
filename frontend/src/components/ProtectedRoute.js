// frontend/src/components/ProtectedRoute.js
import React from 'react';
import authService from '../services/authService';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  if (!authService.isAuthenticated()) {
    // Redirect to login page
    window.location.href = redirectTo;
    return null;
  }
  
  return children;
};

export default ProtectedRoute;