// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import InventoryManagement from './pages/InventoryManagement';
import Login from './pages/Login';
import ConnectionTest from './components/ConnectionTest';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/authService';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/test-connection" element={<ConnectionTest />} />
          
          {/* Protected routes */}
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute>
                <InventoryManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Default route */}
          <Route 
            path="/" 
            element={
              authService.isAuthenticated() 
                ? <Navigate to="/inventory" replace /> 
                : <Navigate to="/login" replace />
            } 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;