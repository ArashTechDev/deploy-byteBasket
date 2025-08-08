// frontend/src/pages/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { getCurrentUser, logoutUser } from '../services/authService';
import reportsService from '../services/reportsService';
import { useCart } from '../contexts/CartContext';
import WishlistModal from '../components/wishlist/WishlistModal';

// Dashboard API calls for real request counts
const dashboardService = {
  // Get dashboard data including real request counts
  getDashboardData: async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      };

      // Get user's requests
      const requestsResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/food-requests/my-requests`,
        config
      );
      const requestsData = await requestsResponse.json();

      // Get cart data (you already have this from useCart)
      const cartResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/cart`,
        config
      );
      const cartData = await cartResponse.json();

      // Calculate statistics
      const totalRequests = requestsData.success ? requestsData.data.length : 0;
      const cartItems = cartData.success ? cartData.data.items.length : 0;

      return {
        success: true,
        data: {
          totalRequests,
          cartItems,
          // You can add more dashboard metrics here
          recentRequests: requestsData.success ? requestsData.data.slice(0, 5) : [],
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');

  // Cart and wishlist states
  const { cart, isUserAuthenticated } = useCart();
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);

  // Real dashboard data state
  const [userDashboardData, setUserDashboardData] = useState({
    totalRequests: 0,
    cartItems: 0,
    recentRequests: [],
  });

  // Load user data and dashboard stats
  const loadUserData = useCallback(async () => {
    try {
      const userResponse = await getCurrentUser();
      if (userResponse.success) {
        setUser(userResponse.data);

        // Load dashboard data for quick stats
        try {
          const dashboardResponse = await reportsService.getDashboardData();
          if (dashboardResponse.success) {
            setDashboardData(dashboardResponse.data);
          }
        } catch (dashboardError) {
          console.warn('Could not load dashboard stats:', dashboardError);
        }
      } else {
        setError('Please log in to access your dashboard');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data. Please log in again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load real dashboard data for user activity
  const loadDashboardData = async () => {
    try {
      const response = await dashboardService.getDashboardData();

      if (response.success) {
        setUserDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    if (isUserAuthenticated) {
      loadDashboardData();
    }
  }, [isUserAuthenticated]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSectionClick = sectionId => {
    switch (sectionId) {
      case 'inventory':
        navigate('/inventory');
        break;
      case 'foodbank':
        navigate('/foodbank');
        break;
      case 'reports':
        navigate('/reports');
        break;
      case 'volunteer':
        navigate('/volunteer');
        break;
      case 'donate':
        navigate('/donate');
        break;
      case 'browse-inventory':
        navigate('/browse-inventory');
        break;
      case 'shift-management':
        navigate('/shift-management');
        break;
      case 'my-cart':
        navigate('/cart'); // Will create this page next
        break;
      case 'my-wishlists':
        setIsWishlistModalOpen(true);
        break;
      case 'request-history':
        navigate('/request-history'); // Will create this page next
        break;
      default:
        console.log('Unknown section:', sectionId);
    }
  };

  const getRoleDisplayName = role => {
    const roleNames = {
      admin: 'Administrator',
      staff: 'Staff Member',
      volunteer: 'Volunteer',
      donor: 'Donor',
      recipient: 'Recipient',
    };
    return roleNames[role] || role;
  };

  // Enhanced sections with cart and wishlist functionality
  const getSectionsForRole = userRole => {
    const allSections = {
      inventory: {
        id: 'inventory',
        title: 'Food Inventory Management',
        description:
          'Track and manage all food donations, check stock levels, and monitor expiration dates.',
        icon: (
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        ),
        buttonText: 'Manage Food Inventory',
      },

      foodbank: {
        id: 'foodbank',
        title: 'Food Bank Locations',
        description:
          'Manage distribution sites, storage locations, and food bank branch information.',
        icon: (
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        ),
        buttonText: 'Manage Food Banks',
      },

      reports: {
        id: 'reports',
        title: 'Analytics & Reports',
        description:
          'View comprehensive reports on donations, distributions, and food bank performance.',
        icon: (
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        ),
        buttonText: 'View Reports',
      },

      volunteer: {
        id: 'volunteer',
        title: 'Volunteer Center',
        description: 'Manage volunteer activities, shifts, and track volunteer hours.',
        icon: (
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
        ),
        buttonText: 'Manage Volunteers',
      },

      shiftManagement: {
        id: 'shift-management',
        title: 'Shift Management',
        description: 'Create and manage volunteer shifts and schedules.',
        icon: (
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        ),
        buttonText: 'Manage Shifts',
      },

      donate: {
        id: 'donate',
        title: 'Make a Donation',
        description: 'Contribute food items or monetary donations to support the community.',
        icon: (
          <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-pink-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        ),
        buttonText: 'Donate Now',
      },

      browse: {
        id: 'browse-inventory',
        title: 'Browse Available Food',
        description: 'Explore available food items and make requests based on your needs.',
        icon: (
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        ),
        buttonText: 'Browse Food Items',
      },

      // NEW SECTIONS FOR CART AND WISHLIST FUNCTIONALITY
      myCart: {
        id: 'my-cart',
        title: 'My Cart',
        description: `Review your selected items (${
          cart?.total_items || cart?.items?.length || 0
        } items) and submit food requests.`,
        icon: (
          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center relative">
            <svg
              className="w-6 h-6 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5A1 1 0 006.8 19H19M7 13v6a1 1 0 001 1h10a1 1 0 001-1v-6M9 19v2m6-2v2"
              />
            </svg>
            {(cart?.total_items || cart?.items?.length) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px]">
                {cart?.total_items || cart?.items?.length}
              </span>
            )}
          </div>
        ),
        buttonText: 'View My Cart',
      },

      myWishlists: {
        id: 'my-wishlists',
        title: 'My Wishlists',
        description: 'Manage your saved food item lists and quickly add them to your cart.',
        icon: (
          <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-rose-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        ),
        buttonText: 'Manage Wishlists',
      },

      requestHistory: {
        id: 'request-history',
        title: 'Request History',
        description: 'View your past food requests and track their status.',
        icon: (
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
        ),
        buttonText: 'View Request History',
      },
    };

    // Define role-based access with enhanced sections
    switch (userRole) {
      case 'admin':
        return [
          allSections.inventory,
          allSections.foodbank,
          allSections.reports,
          allSections.volunteer,
          allSections.shiftManagement,
          allSections.browse,
          allSections.myCart,
          allSections.myWishlists,
        ];
      case 'staff':
        return [
          allSections.inventory,
          allSections.reports,
          allSections.volunteer,
          allSections.shiftManagement,
          allSections.browse,
          allSections.myCart,
          allSections.myWishlists,
        ];
      case 'volunteer':
        return [
          allSections.volunteer,
          allSections.browse,
          allSections.myCart,
          allSections.myWishlists,
        ];
      case 'donor':
        return [
          allSections.donate,
          allSections.browse,
          allSections.myCart,
          allSections.myWishlists,
        ];
      case 'recipient':
        return [
          allSections.browse,
          allSections.myCart,
          allSections.myWishlists,
          allSections.requestHistory,
        ];
      default:
        return [allSections.browse, allSections.myCart, allSections.myWishlists];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('dashboard.loading') || 'Loading...'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('dashboard.loginPrompt') || 'Login Required'}
              </h2>
              <p className="text-gray-600 mb-6">
                {error ||
                  t('dashboard.loginPromptMessage') ||
                  'Please log in to access your dashboard'}
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                >
                  {t('dashboard.signInSignUp') || 'Sign In / Sign Up'}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                >
                  {t('dashboard.goHome') || 'Go Home'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userSections = getSectionsForRole(user.role);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header with Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {user.full_name || 'Demo Administrator'}!
              </h1>
              <p className="text-lg text-gray-600">
                Role:{' '}
                <span className="font-semibold text-orange-600">
                  {getRoleDisplayName(user.role)}
                </span>
              </p>
              {user?.foodbank_id && (
                <p className="text-sm text-gray-500 mt-1">
                  📍 {user.foodbank_id.name} • {user.foodbank_id.location}
                </p>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Cart Quick Access */}
              {isUserAuthenticated && (
                <button
                  onClick={() => handleSectionClick('my-cart')}
                  className="relative bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-lg transition duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5A1 1 0 006.8 19H19M7 13v6a1 1 0 001 1h10a1 1 0 001-1v-6M9 19v2m6-2v2"
                    />
                  </svg>
                  <span>Cart</span>
                  {(cart?.total_items || cart?.items?.length) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart?.total_items || cart?.items?.length}
                    </span>
                  )}
                </button>
              )}

              {/* Wishlist Quick Access */}
              {isUserAuthenticated && (
                <button
                  onClick={() => setIsWishlistModalOpen(true)}
                  className="bg-rose-500 hover:bg-rose-600 text-white p-3 rounded-lg transition duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>Wishlists</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {userSections.map(section => (
            <div
              key={section.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">{section.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {section.description}
                  </p>
                  <button
                    onClick={() => handleSectionClick(section.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 text-sm"
                  >
                    {section.buttonText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats - Only show for admin and staff */}
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData?.quickStats?.totalInventoryItems || '0'}
                </div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {dashboardData?.quickStats?.lowStockCount || '0'}
                </div>
                <div className="text-sm text-gray-600">Low Stock</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {dashboardData?.quickStats?.todayRequests || '0'}
                </div>
                <div className="text-sm text-gray-600">Today's Requests</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dashboardData?.quickStats?.todayDonations || '0'}
                </div>
                <div className="text-sm text-gray-600">Today's Donations</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardData?.quickStats?.pendingRequests || '0'}
                </div>
                <div className="text-sm text-gray-600">Pending Requests</div>
              </div>
            </div>
          </div>
        )}

        {/* Personal Stats for Recipients/Donors - Updated with real data */}
        {isUserAuthenticated && ['recipient', 'donor'].includes(user?.role) && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-teal-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {cart?.items?.length || cart?.total_items || '0'}
                </div>
                <div className="text-sm text-gray-600">Items in Cart</div>
              </div>
              <div className="bg-rose-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-rose-600">
                  {dashboardData?.userStats?.totalWishlists || '0'}
                </div>
                <div className="text-sm text-gray-600">Saved Wishlists</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {userDashboardData.totalRequests}
                </div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </div>
            </div>

            {/* Recent Requests Section */}
            {userDashboardData.recentRequests.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requests</h3>
                <div className="space-y-2">
                  {userDashboardData.recentRequests.map((request, index) => (
                    <div
                      key={request.id || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          Request #{request.id || index + 1}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : request.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {request.status || 'pending'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {request.created_at
                            ? new Date(request.created_at).toLocaleDateString()
                            : 'Recent'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => handleSectionClick('request-history')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All Requests →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wishlist Modal */}
      <WishlistModal isOpen={isWishlistModalOpen} onClose={() => setIsWishlistModalOpen(false)} />
    </div>
  );
};

export default DashboardPage;
