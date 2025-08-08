// frontend/src/App.js - Updated with cart and wishlist routes
import React, { useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import DonatePage from './pages/DonatePage';
import FoodbankPage from './pages/FoodBankManagerPage';
import InventoryPage from './pages/InventoryManagement';
import DashboardPage from './pages/Dashboard';
import VolunteerPage from './pages/VolunteerPage';
import ContactPage from './pages/ContactPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import BrowseInventoryPage from './pages/BrowseInventoryPage';
import ReportsDashboard from './pages/ReportsDashboard';
import RequestSubmissionPage from './pages/RequestSubmissionPage';
import ShiftManagementPage from './pages/ShiftManagementPage';
// NEW: Cart and Request History pages
import CartPage from './pages/CartPage';
import RequestHistoryPage from './pages/RequestHistoryPage';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import SignUpForm from './components/forms/SignUpForm';
import SignInForm from './components/forms/SignInForm';

// Cart and Authentication Integration
import { CartProvider, useCart } from './contexts/CartContext';
import { getCurrentUser } from './services/authService';

// Component to handle authentication state changes and cart initialization
const AuthenticationManager = () => {
  const { refreshCart, isUserAuthenticated } = useCart();

  const checkAuthAndRefreshCart = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && !isUserAuthenticated) {
        const userResponse = await getCurrentUser();
        if (userResponse && userResponse.success) {
          console.log('User authentication confirmed, refreshing cart');
          refreshCart();
        }
      }
    } catch (error) {
      console.log('Authentication check failed:', error.message);
    }
  }, [isUserAuthenticated, refreshCart]);

  React.useEffect(() => {
    checkAuthAndRefreshCart();
  }, [checkAuthAndRefreshCart]);

  return null;
};

// Enhanced SignUpPage component with authentication integration
const EnhancedSignUpPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSignIn, setIsSignIn] = React.useState(false);
  const [showEmailNotification, setShowEmailNotification] = React.useState(false);

  const handleToggleForm = useCallback((showNotification = false) => {
    setIsSignIn(prev => !prev);
    setShowEmailNotification(showNotification);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    console.log('Login successful, navigating to dashboard');
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />

      {showEmailNotification && (
        <div className="max-w-md mx-auto pt-4 px-4">
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm text-center">
              {(t && t('signUp.emailVerificationMessage')) ||
                'Please check your email to verify your account.'}
            </p>
          </div>
        </div>
      )}

      <main className="py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            {(t && t('signUp.pageTitle')) || 'Sign Up / Sign In'}
          </h1>

          <div className="bg-gray-600 rounded-lg p-8">
            {!isSignIn ? (
              <SignUpForm onToggleForm={handleToggleForm} />
            ) : (
              <SignInForm onToggleForm={handleToggleForm} onLoginSuccess={handleLoginSuccess} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Main App Component with React Router
const App = () => {
  return (
    <CartProvider>
      <Router>
        <div className="App min-h-screen flex flex-col">
          {/* Authentication and Cart Management */}
          <AuthenticationManager />

          {/* Main Content */}
          <div className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/signup" element={<EnhancedSignUpPage />} />
              <Route path="/signin" element={<Navigate to="/signup" replace />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/email-verification" element={<EmailVerificationPage />} />
              <Route path="/browse-inventory" element={<BrowseInventoryPage />} />

              {/* Protected Routes - User needs to be logged in */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/volunteer" element={<VolunteerPage />} />
              <Route path="/request-submission" element={<RequestSubmissionPage />} />

              {/* NEW: Cart and Wishlist Routes */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="/my-cart" element={<Navigate to="/cart" replace />} />
              <Route path="/request-history" element={<RequestHistoryPage />} />
              <Route path="/my-requests" element={<Navigate to="/request-history" replace />} />

              {/* Admin/Staff Routes */}
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/foodbank" element={<FoodbankPage />} />
              <Route path="/reports" element={<ReportsDashboard />} />
              <Route path="/shift-management" element={<ShiftManagementPage />} />

              {/* Legacy Route Redirects */}
              <Route
                path="/inventory-browse"
                element={<Navigate to="/browse-inventory" replace />}
              />
              <Route
                path="/submit-request"
                element={<Navigate to="/request-submission" replace />}
              />

              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
