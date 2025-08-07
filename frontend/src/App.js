// frontend/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
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
import InventoryBrowsePage from './pages/InventoryBrowsePage';
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

  // Memoize the authentication check function to prevent unnecessary re-renders
  const checkAuthAndRefreshCart = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && !isUserAuthenticated) {
        // Token exists but cart context doesn't know user is authenticated
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

  useEffect(() => {
    checkAuthAndRefreshCart();
  }, [checkAuthAndRefreshCart]);

  return null; // This component doesn't render anything
};

// Component to handle login success across different pages
const LoginSuccessHandler = ({ onLoginSuccess, currentPage }) => {
  const { refreshCart } = useCart();

  // Memoize the login success handler
  const handleLoginSuccess = useCallback(async () => {
    console.log('Login success detected, refreshing cart');
    await refreshCart();
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  }, [refreshCart, onLoginSuccess]);

  useEffect(() => {
    // Only set up login success handling if we're on a page that needs it
    if (currentPage === 'signup' || currentPage === 'dashboard') {
      console.log(`Login success handler ready for ${currentPage} page`);
    }
  }, [currentPage, handleLoginSuccess]);

  return null; // This component doesn't render anything
};

// Enhanced SignUpPage component with authentication integration
const SignUpPageWithAuth = ({ onNavigate, onLoginSuccess }) => {
  const { refreshCart } = useCart();

  // Fixed: Memoize the login success handler to prevent infinite re-renders
  const handleSignUpLoginSuccess = useCallback(async () => {
    console.log('SignUp page: Login successful, refreshing cart');
    try {
      await refreshCart();
      // Navigate to dashboard after successful login
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error('Error refreshing cart after login:', error);
      // Still navigate even if cart refresh fails
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }
  }, [refreshCart, onLoginSuccess]);

  return <EnhancedSignUpPage onNavigate={onNavigate} onLoginSuccess={handleSignUpLoginSuccess} />;
};

// Enhanced Dashboard component with logout integration
const DashboardPageWithAuth = ({ onNavigate, onLogout }) => {
  const { refreshCart } = useCart();

  // Fixed: Use dependency array properly to prevent infinite loops
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await refreshCart();
      } catch (error) {
        console.log('Failed to refresh cart on dashboard load:', error.message);
      }
    };

    loadDashboardData();
  }, []); // Empty dependency array - only run on mount

  const handleDashboardLogout = useCallback(async () => {
    try {
      // Clear cart data on logout
      // (CartContext will handle this automatically when token is removed)
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [onLogout]);

  return <DashboardPage onNavigate={onNavigate} onLogout={handleDashboardLogout} />;
};

// Enhanced SignUpPage component that integrates with cart and auth
const EnhancedSignUpPage = ({ onNavigate, onLoginSuccess }) => {
  const { t } = useTranslation();
  const [isSignIn, setIsSignIn] = useState(false);
  const [showEmailNotification, setShowEmailNotification] = useState(false);

  const handleToggleForm = useCallback((showNotification = false) => {
    setIsSignIn(prev => !prev);
    setShowEmailNotification(showNotification);
  }, []);

  const handleLoginSuccessInternal = useCallback(() => {
    console.log('EnhancedSignUpPage: Login successful');
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  }, [onLoginSuccess]);

  return (
    <div className="min-h-screen bg-gray-200">
      <Header currentPage="signup" onNavigate={onNavigate} />

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
              <SignUpForm onToggleForm={handleToggleForm} onNavigate={onNavigate} />
            ) : (
              <SignInForm
                onToggleForm={handleToggleForm}
                onNavigate={onNavigate}
                onLoginSuccess={handleLoginSuccessInternal}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  // Memoize navigation function to prevent unnecessary re-renders
  const navigate = useCallback(page => {
    console.log(`Navigating to: ${page}`);
    setCurrentPage(page);
  }, []);

  // Memoize login success handler to prevent infinite loops
  const handleLoginSuccess = useCallback(() => {
    console.log('App: Login successful, navigating to dashboard');
    navigate('dashboard');
  }, [navigate]);

  // Render the appropriate page based on current route
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;

      case 'signup':
        return <SignUpPageWithAuth onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;

      case 'donate':
        return <DonatePage onNavigate={navigate} />;

      case 'foodbank':
        return <FoodbankPage onNavigate={navigate} />;

      case 'inventory':
        return <InventoryPage onNavigate={navigate} />;

      case 'dashboard':
        return <DashboardPageWithAuth onNavigate={navigate} onLogout={() => navigate('home')} />;

      case 'volunteer':
        return <VolunteerPage onNavigate={navigate} />;

      case 'contact':
        return <ContactPage onNavigate={navigate} />;

      case 'email-verification':
        return <EmailVerificationPage onNavigate={navigate} />;

      case 'browse-inventory':
        return <BrowseInventoryPage onNavigate={navigate} />;

      case 'reports':
        return <ReportsDashboard onNavigate={navigate} />;

      case 'request-submission':
        return <RequestSubmissionPage onNavigate={navigate} />;

      case 'inventory-browse':
        return <InventoryBrowsePage onNavigate={navigate} />;

      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <CartProvider>
      <div className="App min-h-screen flex flex-col">
        {/* Authentication and Cart Management */}
        <AuthenticationManager />
        <LoginSuccessHandler onLoginSuccess={handleLoginSuccess} currentPage={currentPage} />

        {/* Main Content */}
        <div className="flex-grow">{renderPage()}</div>

        {/* Footer */}
        <Footer />
      </div>
    </CartProvider>
  );
};

export default App;
