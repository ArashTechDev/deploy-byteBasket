// frontend/src/App.js
import React, { useState, useEffect } from 'react';
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

// Cart and Authentication Integration
import { CartProvider, useCart } from './contexts/CartContext';
import { getCurrentUser } from './services/authService';

// Component to handle authentication state changes and cart initialization
const AuthenticationManager = () => {
  const { refreshCart, isUserAuthenticated } = useCart();

  useEffect(() => {
    // Monitor authentication state changes
    const checkAuthAndRefreshCart = async () => {
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
    };

    // Check authentication on mount
    checkAuthAndRefreshCart();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = e => {
      if (e.key === 'token') {
        if (e.newValue) {
          // Token was added - refresh cart
          setTimeout(() => refreshCart(), 100);
        }
        // If token was removed, cart context will handle it automatically
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isUserAuthenticated, refreshCart]);

  return null; // This component doesn't render anything
};

// Component to handle post-login actions
const LoginSuccessHandler = ({ onLoginSuccess, currentPage }) => {
  const { refreshCart } = useCart();

  const handleLoginSuccess = async () => {
    console.log('Login successful, refreshing cart');

    // Small delay to ensure token is stored
    setTimeout(async () => {
      await refreshCart();
    }, 100);

    // Call the original login success handler
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  // Attach the handler to the component for external access
  LoginSuccessHandler.handleLoginSuccess = handleLoginSuccess;

  return null;
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [loginSuccessHandler, setLoginSuccessHandler] = useState(null);

  // Handle URL parameters for deep linking
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    const path = window.location.pathname;

    if (path === '/verify-email' || path.includes('verify-email')) {
      setCurrentPage('verify-email');
    } else if (pageParam === 'verify') {
      setCurrentPage('verify-email');
    } else if (pageParam) {
      setCurrentPage(pageParam);
    }
  }, []);

  const navigate = page => {
    console.log(`Navigating to: ${page}`);
    setCurrentPage(page);

    // Update URL without page refresh
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    window.history.pushState({}, '', url);
  };

  const handleLoginSuccess = () => {
    console.log('Login success - navigating to dashboard');

    // Trigger the login success handler if available
    if (loginSuccessHandler) {
      loginSuccessHandler();
    }

    // Navigate to dashboard
    navigate('dashboard');
  };

  const handleLogout = () => {
    console.log('Logout - navigating to home');

    // Clear any cached user data
    localStorage.removeItem('token');
    localStorage.removeItem('volunteerRegistered');
    localStorage.removeItem('volunteerName');

    // Navigate to home
    navigate('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;

      case 'signup':
        return (
          <SignUpPageWithAuth
            onNavigate={navigate}
            onLoginSuccess={handleLoginSuccess}
            setLoginSuccessHandler={setLoginSuccessHandler}
          />
        );

      case 'donate':
        return <DonatePage onNavigate={navigate} />;

      case 'inventory':
        return <InventoryPage onNavigate={navigate} />;

      case 'foodbank':
        return <FoodbankPage onNavigate={navigate} />;

      case 'dashboard':
        return <DashboardPageWithAuth onNavigate={navigate} onLogout={handleLogout} />;

      case 'volunteer':
        return <VolunteerPage onNavigate={navigate} />;

      case 'contact':
        return <ContactPage onNavigate={navigate} />;

      case 'verify-email':
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

// Enhanced SignUpPage component with authentication integration
const SignUpPageWithAuth = ({ onNavigate, onLoginSuccess, setLoginSuccessHandler }) => {
  const { refreshCart } = useCart();

  useEffect(() => {
    // Set the login success handler for this page
    const handler = async () => {
      console.log('SignUp page: Login successful, refreshing cart');
      await refreshCart();
    };

    setLoginSuccessHandler(() => handler);

    return () => {
      setLoginSuccessHandler(null);
    };
  }, [refreshCart, setLoginSuccessHandler]);

  const handleSignUpLoginSuccess = async () => {
    // Refresh cart on successful login
    await refreshCart();
    // Call the parent login success handler
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return <EnhancedSignUpPage onNavigate={onNavigate} onLoginSuccess={handleSignUpLoginSuccess} />;
};

// Enhanced Dashboard component with logout integration
const DashboardPageWithAuth = ({ onNavigate, onLogout }) => {
  const { cart, refreshCart } = useCart();

  useEffect(() => {
    // Ensure cart is loaded when dashboard mounts
    const loadDashboardData = async () => {
      try {
        // Refresh cart data when dashboard loads
        await refreshCart();
      } catch (error) {
        console.log('Failed to refresh cart on dashboard load:', error.message);
      }
    };

    loadDashboardData();
  }, [refreshCart]);

  const handleDashboardLogout = async () => {
    // Clear cart data on logout
    // (CartContext will handle this automatically when token is removed)
    if (onLogout) {
      onLogout();
    }
  };

  return <DashboardPage onNavigate={onNavigate} onLogout={handleDashboardLogout} />;
};

// Enhanced SignUpPage component that integrates with cart and auth
const EnhancedSignUpPage = ({ onNavigate, onLoginSuccess }) => {
  const { t } = useTranslation();
  const [isSignIn, setIsSignIn] = useState(false);
  const [showEmailNotification, setShowEmailNotification] = useState(false);

  const handleToggleForm = (showNotification = false) => {
    setIsSignIn(!isSignIn);
    setShowEmailNotification(showNotification);
  };

  const handleLoginSuccessInternal = () => {
    console.log('EnhancedSignUpPage: Login successful');
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

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
              <EnhancedSignInForm
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

// Enhanced SignInForm that triggers cart refresh on successful login
const EnhancedSignInForm = ({ onToggleForm, onNavigate, onLoginSuccess }) => {
  const { t } = useTranslation();
  const { refreshCart } = useCart();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { loginUser } = await import('../services/authService');
      const response = await loginUser(formData);

      if (response.success && response.token) {
        console.log('Login successful, token stored');

        // Token is already stored by authService
        // Refresh cart after successful login
        setTimeout(async () => {
          try {
            await refreshCart();
            console.log('Cart refreshed after login');
          } catch (error) {
            console.log('Failed to refresh cart after login:', error.message);
          }
        }, 100);

        // Call success handler
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          onNavigate('dashboard');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert(
        err.response?.data?.message ||
          err.message ||
          (t && t('signInForm.loginFailed')) ||
          'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          {(t && t('signInForm.emailLabel')) || 'Email'}
        </label>
        <input
          name="email"
          type="email"
          placeholder={(t && t('signInForm.emailPlaceholder')) || 'Enter your email'}
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">
          {(t && t('signInForm.passwordLabel')) || 'Password'}
        </label>
        <input
          name="password"
          type="password"
          placeholder={(t && t('signInForm.passwordPlaceholder')) || 'Enter your password'}
          value={formData.password}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
          required
        />
      </div>

      <div className="text-right">
        <button
          type="button"
          onClick={onToggleForm}
          className="text-orange-400 text-sm hover:text-orange-300"
        >
          {(t && t('signInForm.orSignUp')) || 'Or Sign Up'}
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 rounded-md font-medium transition-colors ${
          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-400 hover:bg-orange-500'
        } text-white`}
      >
        {isLoading ? 'Signing In...' : (t && t('signInForm.submit')) || 'Sign In'}
      </button>
    </form>
  );
};

// Import useTranslation hook if available
let useTranslation;
try {
  const i18n = require('react-i18next');
  useTranslation = i18n.useTranslation;
} catch (error) {
  // Fallback if react-i18next is not available
  useTranslation = () => ({ t: (key, defaultValue) => defaultValue || key });
}

// Import Header component
let Header;
try {
  Header = require('./components/layout/Header').default;
} catch (error) {
  // Fallback Header component
  Header = ({ currentPage, onNavigate }) => (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-lg font-bold text-teal-700">ByteBasket</div>
          <nav className="flex space-x-4">
            <button
              onClick={() => onNavigate('home')}
              className="text-gray-700 hover:text-gray-900"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="text-gray-700 hover:text-gray-900"
            >
              Sign Up
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-gray-700 hover:text-gray-900"
            >
              Dashboard
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

// Import SignUpForm
let SignUpForm;
try {
  SignUpForm = require('./components/forms/SignUpForm').default;
} catch (error) {
  SignUpForm = () => <div>SignUpForm component not found</div>;
}

export default App;
