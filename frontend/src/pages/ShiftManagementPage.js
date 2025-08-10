// frontend/src/pages/ShiftManagementPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';

const ShiftManagementPage = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    // Simulate loading shifts data
    setTimeout(() => {
      setShifts([
        {
          id: 1,
          title: 'Food Sorting',
          date: '2024-08-10',
          time: '09:00 - 12:00',
          location: 'Main Warehouse',
          volunteers: 3,
          capacity: 5,
          status: 'active',
        },
        {
          id: 2,
          title: 'Food Distribution',
          date: '2024-08-11',
          time: '14:00 - 17:00',
          location: 'Community Center',
          volunteers: 2,
          capacity: 4,
          status: 'active',
        },
        {
          id: 3,
          title: 'Inventory Management',
          date: '2024-08-12',
          time: '10:00 - 14:00',
          location: 'Main Warehouse',
          volunteers: 1,
          capacity: 3,
          status: 'draft',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'shifts', name: 'Manage Shifts', icon: '📅' },
    { id: 'volunteers', name: 'Volunteer Assignments', icon: '👥' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading shift management...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shift Management</h1>
            <p className="mt-2 text-gray-600">Create and manage volunteer shifts and schedules</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              ← Back to Dashboard
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
              + Create New Shift
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
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
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Shifts</p>
                    <p className="text-2xl font-semibold text-gray-900">{shifts.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-600"
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
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Volunteers</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {shifts.reduce((sum, shift) => sum + shift.volunteers, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-yellow-600"
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
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Upcoming Shifts</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {shifts.filter(shift => shift.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-purple-600"
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
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Open Spots</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {shifts.reduce((sum, shift) => sum + (shift.capacity - shift.volunteers), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Shifts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Shifts</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shift
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Volunteers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {shifts.map(shift => (
                      <tr key={shift.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{shift.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{shift.date}</div>
                          <div className="text-sm text-gray-500">{shift.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{shift.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {shift.volunteers}/{shift.capacity}
                          </div>
                          <div
                            className={`text-xs ${
                              shift.volunteers === shift.capacity
                                ? 'text-green-600'
                                : shift.volunteers === 0
                                ? 'text-red-600'
                                : 'text-yellow-600'
                            }`}
                          >
                            {shift.volunteers === shift.capacity
                              ? 'Full'
                              : shift.volunteers === 0
                              ? 'No volunteers'
                              : `${shift.capacity - shift.volunteers} spots left`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              shift.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {shift.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shifts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shift Management</h3>
              <p className="text-gray-600 mb-4">
                Create, edit, and manage volunteer shifts. You can set schedules, assign volunteers,
                and track attendance.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
                  Create New Shift
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
                  Bulk Import Shifts
                </button>
              </div>
            </div>

            {/* Shift Templates */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Quick Shift Templates</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer">
                  <h5 className="font-medium text-gray-900">Food Sorting</h5>
                  <p className="text-sm text-gray-500">3-hour shift, 5 volunteers</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer">
                  <h5 className="font-medium text-gray-900">Food Distribution</h5>
                  <p className="text-sm text-gray-500">4-hour shift, 4 volunteers</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer">
                  <h5 className="font-medium text-gray-900">Inventory Management</h5>
                  <p className="text-sm text-gray-500">4-hour shift, 3 volunteers</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'volunteers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Volunteer Assignments</h3>
              <p className="text-gray-600">
                Manage volunteer assignments, view availability, and track performance.
              </p>
              <div className="mt-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                  View All Volunteers
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shift Analytics</h3>
              <p className="text-gray-600">
                View detailed analytics about volunteer participation, shift efficiency, and
                performance metrics.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900">Attendance Rate</h5>
                  <p className="text-2xl font-bold text-green-600">94%</p>
                  <p className="text-sm text-gray-500">Last 30 days</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900">Average Volunteers per Shift</h5>
                  <p className="text-2xl font-bold text-blue-600">3.2</p>
                  <p className="text-sm text-gray-500">This month</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftManagementPage;
