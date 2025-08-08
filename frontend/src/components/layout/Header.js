// frontend/src/components/layout/Header.js - Enhanced version
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../images/logo.png';
import { useCart } from '../../contexts/CartContext';
import CartIcon from '../cart/CartIcon';
import { getCurrentUser, logoutUser } from '../../services/authService';
import WishlistModal from '../wishlist/WishlistModal';

// Language Switcher Component (unchanged)
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = langCode => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        aria-label="Change language"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium text-gray-700">
          {currentLanguage.code.toUpperCase()}
        </span>
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {languages.map(({ code, name, flag }) => (
            <button
              key={code}
              onClick={() => changeLanguage(code)}
              className={`w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                code === currentLanguage.code
                  ? 'bg-orange-100 text-orange-700 font-semibold'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              role="menuitem"
            >
              <span className="text-lg">{flag}</span>
              <span>{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// User Menu Component
const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = action => {
    setIsOpen(false);
    switch (action) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'cart':
        navigate('/cart');
        break;
      case 'wishlists':
        setIsWishlistModalOpen(true);
        break;
      case 'requests':
        navigate('/request-history');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'logout':
        onLogout();
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</div>
            <div className="text-xs text-gray-500 capitalize">{user?.role || 'Guest'}</div>
          </div>
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-900">{user?.full_name}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>

            <button
              onClick={() => handleMenuClick('dashboard')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleMenuClick('cart')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5A1 1 0 006.8 19H19M7 13v6a1 1 0 001 1h10a1 1 0 001-1v-6M9 19v2m6-2v2"
                />
              </svg>
              <span>My Cart</span>
            </button>

            <button
              onClick={() => handleMenuClick('wishlists')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>My Wishlists</span>
            </button>

            <button
              onClick={() => handleMenuClick('requests')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <span>Request History</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={() => handleMenuClick('logout')}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      <WishlistModal isOpen={isWishlistModalOpen} onClose={() => setIsWishlistModalOpen(false)} />
    </>
  );
};

const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, isUserAuthenticated } = useCart();
  const [user, setUser] = useState(null);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);

  // Get current page from pathname
  const currentPage = location.pathname.substring(1) || 'home';

  // Load user data on component mount
  useEffect(() => {
    const loadUser = async () => {
      if (isUserAuthenticated) {
        try {
          const response = await getCurrentUser();
          if (response.success) {
            setUser(response.data);
          }
        } catch (error) {
          console.error('Failed to load user:', error);
        }
      }
    };

    loadUser();
  }, [isUserAuthenticated]);

  const navigationItems = [
    { key: 'dashboard', label: t('navDashboard') || 'Dashboard', path: '/dashboard' },
    { key: 'volunteer', label: t('navVolunteer') || 'Volunteer', path: '/volunteer' },
    { key: 'contact', label: t('navContact') || 'Contact Us', path: '/contact' },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCartClick = () => {
    if (isUserAuthenticated) {
      navigate('/cart');
    } else {
      alert('Please log in to view your cart');
      navigate('/signup');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <img
              src={logo}
              alt={t('appName') || 'Bytebasket'}
              className="w-16 h-16 object-contain"
            />
            <div>
              <div className="text-lg font-bold text-teal-700">{t('appName') || 'Bytebasket'}</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map(({ key, label, path }) => (
                <button
                  key={key}
                  onClick={() => navigate(path)}
                  className={`font-medium transition-colors ${
                    currentPage === key ? 'text-orange-500' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon - Show for authenticated users */}
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* User Menu or Auth Buttons */}
              {isUserAuthenticated && user ? (
                <UserMenu user={user} onLogout={handleLogout} />
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate('/signin')}
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Donate Button */}
          <button
            onClick={() => navigate('/donate')}
            className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-2 rounded-full font-medium transition-colors"
          >
            {t('donate') || 'Donate'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
