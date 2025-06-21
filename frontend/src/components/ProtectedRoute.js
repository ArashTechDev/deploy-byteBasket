// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  if (!authService.isAuthenticated()) {
    // Use React Router's Navigate instead of window.location.href
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
};

export default ProtectedRoute;