// frontend/src/pages/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { getCurrentUser, logoutUser } from '../services/authService';
import reportsService from '../services/reportsService';

const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');

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
          // Don't set error here as user data loaded successfully
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

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSectionClick = sectionId => {
    // Navigate to the appropriate route based on section ID
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

  // Define sections based on user role
  const getSectionsForRole = userRole => {
    const allSections = {
      inventory: {
        id: 'inventory',
        title: 'Inventory Management',
        description: 'Manage inventory items, track donations and usage.',
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
        buttonText: 'Go to Inventory',
      },
      foodbank: {
        id: 'foodbank',
        title: 'Food Bank Management',
        description: 'Add, update, or remove food bank locations.',
        icon: (
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        ),
        buttonText: 'Go to Food Bank Locations',
      },
      reports: {
        id: 'reports',
        title: 'Reports & Analytics',
        description: 'View comprehensive reports and analytics.',
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
      donate: {
        id: 'donate',
        title: 'Make a Donation',
        description: 'Quickly donate food, money, or resources.',
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        ),
        buttonText: 'Start Donating',
      },
      volunteer: {
        id: 'volunteer',
        title: 'Volunteer Dashboard',
        description: 'View and manage your assigned volunteering tasks.',
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        ),
        buttonText: 'Go to Volunteer Area',
      },
      shiftManagement: {
        id: 'shift-management',
        title: 'Shift Management',
        description: 'Create and manage volunteer shifts and schedules.',
        icon: (
          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        ),
        buttonText: 'Manage Shifts',
      },
      browse: {
        id: 'browse-inventory',
        title: 'Browse Available Items',
        description: 'Browse and request available food items.',
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
        buttonText: 'Browse Items',
      },
    };

    // Return sections based on user role
    switch (userRole) {
      case 'admin':
        return [
          allSections.inventory,
          allSections.foodbank,
          allSections.reports,
          allSections.volunteer,
          allSections.shiftManagement,
        ];
      case 'staff':
        return [
          allSections.inventory,
          allSections.reports,
          allSections.volunteer,
          allSections.shiftManagement,
        ];
      case 'volunteer':
        return [allSections.volunteer, allSections.browse];
      case 'donor':
        return [allSections.donate, allSections.browse];
      case 'recipient':
        return [allSections.browse];
      default:
        return [allSections.browse];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('dashboard.loading')}</p>
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
                {t('dashboard.loginPrompt')}
              </h2>
              <p className="text-gray-600 mb-6">{error || t('dashboard.loginPromptMessage')}</p>
              <div className="space-x-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                >
                  {t('dashboard.signInSignUp')}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
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

  const userSections = getSectionsForRole(user.role);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
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

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {userSections.map(section => (
            <div key={section.id} className="bg-white rounded-xl shadow-lg p-6">
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
      </div>
    </div>
  );
};

export default DashboardPage;
