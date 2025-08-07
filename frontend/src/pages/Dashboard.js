/* eslint-disable no-console */
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
    localStorage.removeItem('volunteerRegistered');
    localStorage.removeItem('volunteerName');
    onNavigate('home');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No authentication token found');
          setError(t('dashboard.errors.noToken'));
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
          setError(t('dashboard.errors.fetchFailed'));
          setUser(null);
          // Clear invalid token
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);

        // Handle different types of errors
        if (error.response?.status === 401) {
          console.log('Authentication failed - invalid or expired token');
          setError(
            t('dashboard.errors.authenticationFailed') ||
              'Authentication failed. Please log in again.'
          );
          localStorage.removeItem('token');
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

  // Auto-redirect to login after 3 seconds if there's an authentication error
  useEffect(() => {
    if (error && !loading && !user) {
      const timer = setTimeout(() => {
        console.log('Auto-redirecting to login due to authentication error');
        onNavigate('signup');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, loading, user, onNavigate]);

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
          <p className="text-lg">{t('dashboard.loading')}</p>
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
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Authentication Error</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
              <p className="text-sm text-gray-500 mb-8">
                You will be redirected to the login page in a few seconds...
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('signup')}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  Go to Login
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-all duration-200"
                >
                  {t('dashboard.goHome')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <Header currentPage="dashboard" onNavigate={onNavigate} />
        <div className="flex items-center justify-center px-4 pt-16">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {t('dashboard.loginPrompt')}
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {t('dashboard.accountNotFoundMessage')}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('signup')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  {t('dashboard.signInSignUp')}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-all duration-200"
                >
                  {t('dashboard.goHome')}
                </button>
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-500">{t('dashboard.newUserMessage')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userSections = sectionData(t)[user.role] || [];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header currentPage="dashboard" onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('dashboard.welcome', { name: user.name })}
              </h1>
              <p className="text-gray-600">{t(`dashboard.roleDescription.${user.role}`)}</p>
              {user.email && <p className="text-sm text-gray-500 mt-1">{user.email}</p>}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              {t('dashboard.logout')}
            </button>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSections.map(section => (
            <div
              key={section.id}
              onClick={() => onNavigate(section.id)}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200"
            >
              <div className="flex items-center mb-4">
                {section.icon}
                <h3 className="text-xl font-semibold text-gray-900 ml-3">{section.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{section.description}</p>
            </div>
          ))}
        </div>

        {userSections.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sections available</h3>
            <p className="text-gray-500">
              There are no dashboard sections configured for your role ({user.role}).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
