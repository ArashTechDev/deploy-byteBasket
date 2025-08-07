/* eslint-disable no-console */
// frontend/src/pages/Dashboard.js - FIXED VERSION
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import { getCurrentUser, logoutUser } from '../services/authService';

const sectionData = t => ({
  admin: [
    {
      id: 'inventory',
      title: t('dashboard.sections.inventory.title'),
      description: t('dashboard.sections.inventory.description'),
      icon: (
        <svg className="w-10 h-10 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />
        </svg>
      ),
    },
    {
      id: 'foodbank',
      title: t('dashboard.sections.foodbank.title'),
      description: t('dashboard.sections.foodbank.description'),
      icon: (
        <svg className="w-10 h-10 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
        </svg>
      ),
    },
    {
      id: 'reports',
      title: t('dashboard.sections.reports.title') || 'Reports',
      description: t('dashboard.sections.reports.description') || 'View analytics and reports',
      icon: (
        <svg className="w-10 h-10 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
        </svg>
      ),
    },
  ],
  staff: [
    {
      id: 'inventory',
      title: t('dashboard.sections.inventory.title'),
      description: t('dashboard.sections.inventory.description'),
      icon: (
        <svg className="w-10 h-10 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />
        </svg>
      ),
    },
    {
      id: 'volunteer',
      title: t('dashboard.sections.volunteer.title') || 'Volunteer Management',
      description: t('dashboard.sections.volunteer.description') || 'Manage volunteers and shifts',
      icon: (
        <svg className="w-10 h-10 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 8c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zM12 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM22 18v2H2v-2c0-2.21 3.13-4 8-4s8 1.79 8 4zM8 16c-2.67 0-6 1.34-6 2v1h12v-1c0-.66-3.33-2-6-2z" />
        </svg>
      ),
    },
  ],
  donor: [
    {
      id: 'donate',
      title: t('dashboard.sections.donate.title'),
      description: t('dashboard.sections.donate.description'),
      icon: (
        <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.5 4 6 4c1.54 0 3.04.99 3.57 2.36h.87C14.46 4.99 15.96 4 17.5 4 20 4 21.5 6 21.5 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
    },
    {
      id: 'browse',
      title: t('dashboard.sections.browse.title') || 'Browse Inventory',
      description: t('dashboard.sections.browse.description') || 'View available items',
      icon: (
        <svg className="w-10 h-10 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      ),
    },
  ],
  volunteer: [
    {
      id: 'tasks',
      title: t('dashboard.sections.tasks.title'),
      description: t('dashboard.sections.tasks.description'),
      icon: (
        <svg className="w-10 h-10 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 11H7v2h2v-2zm0-4H7v2h2V7zm0 8H7v2h2v-2zm10-8h-8v2h8V7zm0 4h-8v2h8v-2zm0 4h-8v2h8v-2zM3 5v14h18V5H3zm16 12H5V7h14v10z" />
        </svg>
      ),
    },
  ],
  recipient: [
    {
      id: 'browse',
      title: t('dashboard.sections.browse.title') || 'Browse Available Items',
      description:
        t('dashboard.sections.browse.description') || 'View and request available food items',
      icon: (
        <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      ),
    },
    {
      id: 'request',
      title: t('dashboard.sections.request.title') || 'Submit Request',
      description: t('dashboard.sections.request.description') || 'Request food items',
      icon: (
        <svg className="w-10 h-10 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 7h-3V6c0-1.1-.9-2-2-2H10c-1.1 0-2 .9-2 2v1H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 6h4v1h-4V6z" />
        </svg>
      ),
    },
  ],
});

const DashboardPage = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('authToken'); // Clear both token keys
    localStorage.removeItem('volunteerRegistered');
    localStorage.removeItem('volunteerName');
    onNavigate('home');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) {
          console.log('No authentication token found');
          setError(
            t('dashboard.errors.noToken') || 'No authentication token found. Please log in.'
          );
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('Attempting to fetch user with token');
        const response = await getCurrentUser();

        if (response && response.success) {
          console.log('User fetched successfully:', response.data);
          setUser(response.data);
          setError(null);
        } else {
          console.log('Failed to fetch user - invalid response:', response);
          setError(
            t('dashboard.errors.fetchFailed') ||
              'Failed to fetch user data. Please try logging in again.'
          );
          setUser(null);
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);

        // Handle different types of errors
        if (error.response?.status === 401) {
          console.log('Authentication failed - invalid or expired token');
          setError(
            t('dashboard.errors.authenticationFailed') ||
              'Your session has expired. Please log in again.'
          );
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
        } else if (error.response?.status === 500) {
          console.log('Server error during authentication');
          setError(t('dashboard.errors.serverError') || 'Server error. Please try again later.');
        } else if (error.code === 'ERR_NETWORK') {
          console.log('Network error during authentication');
          setError(
            t('dashboard.errors.networkError') || 'Network error. Please check your connection.'
          );
        } else {
          console.log('General authentication error');
          setError(
            t('dashboard.errors.fetchFailed') ||
              'Failed to authenticate. Please try logging in again.'
          );
        }

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [t]);

  // FIXED: Auto-redirect to SIGNIN (not signup) after authentication error
  useEffect(() => {
    if (error && !loading && !user) {
      // Show error for 3 seconds, then redirect to signin
      const timer = setTimeout(() => {
        console.log('Auto-redirecting to signin due to authentication error');
        onNavigate('signin'); // CHANGED FROM 'signup' TO 'signin'
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, loading, user, onNavigate]);

  const handleSectionClick = sectionId => {
    console.log(`Navigating to: ${sectionId}`);
    onNavigate(sectionId);
  };

  const getUserSections = () => {
    if (!user || !user.role) return [];
    return sectionData(t)[user.role] || [];
  };

  const getRoleDisplayName = role => {
    const roleNames = {
      admin: t('dashboard.roles.admin') || 'Administrator',
      staff: t('dashboard.roles.staff') || 'Staff Member',
      donor: t('dashboard.roles.donor') || 'Donor',
      volunteer: t('dashboard.roles.volunteer') || 'Volunteer',
      recipient: t('dashboard.roles.recipient') || 'Recipient',
    };
    return roleNames[role] || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header currentPage="dashboard" onNavigate={onNavigate} />
        <div className="text-center mt-10 text-gray-500">
          <svg
            className="animate-spin h-8 w-8 mx-auto mb-4 text-orange-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <p className="text-lg">{t('dashboard.loading') || 'Loading dashboard...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <Header currentPage="dashboard" onNavigate={onNavigate} />
        <div className="flex items-center justify-center px-4 pt-16">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('dashboard.sessionExpired') || 'Session Expired'}
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('signin')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                >
                  {t('dashboard.signInAgain') || 'Sign In Again'}
                </button>
                <button
                  onClick={() => onNavigate('home')}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-200"
                >
                  {t('dashboard.goHome') || 'Go to Home'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                {t('dashboard.redirecting') || 'Redirecting to sign in in a few seconds...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userSections = getUserSections();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header currentPage="dashboard" onNavigate={onNavigate} />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {t('dashboard.welcome')} {user?.name || 'User'}!
              </h1>
              <p className="text-lg text-gray-600">
                {t('Greetings')}{' '}
                <span className="font-semibold text-orange-600">
                  {getRoleDisplayName(user?.role)}
                </span>
              </p>
              {user?.foodbank_id && (
                <p className="text-sm text-gray-500 mt-1">
                  📍 {user.foodbank_id.name} • {user.foodbank_id.location}
                </p>
              )}
            </div>
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
              <span>{t('dashboard.logout')}</span>
            </button>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSections.map(section => (
            <div
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">{section.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{section.description}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-orange-500 font-medium text-sm flex items-center">
                  {t('dashboard.clickToAccess')}
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats (optional - can be expanded based on role) */}
        {user?.role === 'admin' || user?.role === 'staff' ? (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('dashboard.quickStats') || 'Quick Stats'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">-</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">-</div>
                <div className="text-sm text-gray-600">Low Stock</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">-</div>
                <div className="text-sm text-gray-600">Expiring Soon</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">-</div>
                <div className="text-sm text-gray-600">Recent Donations</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DashboardPage;
