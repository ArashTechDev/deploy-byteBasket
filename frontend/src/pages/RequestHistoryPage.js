// frontend/src/pages/RequestHistoryPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getCurrentUser } from '../services/authService';

// Mock service - you'll need to create this based on your backend API
const requestService = {
  getUserRequests: async () => {
    // This should be replaced with actual API call
    // For now, returning mock data
    return {
      success: true,
      data: [
        {
          _id: '1',
          request_date: '2024-01-15',
          status: 'completed',
          items: [
            { item_name: 'Canned Beans', quantity: 2, category: 'Protein' },
            { item_name: 'Rice', quantity: 1, category: 'Grains' },
          ],
          fulfilled_date: '2024-01-16',
          notes: 'Delivered successfully',
        },
        {
          _id: '2',
          request_date: '2024-01-20',
          status: 'pending',
          items: [
            { item_name: 'Pasta', quantity: 3, category: 'Grains' },
            { item_name: 'Tomato Sauce', quantity: 2, category: 'Condiments' },
          ],
          notes: 'Awaiting approval',
        },
        {
          _id: '3',
          request_date: '2024-01-25',
          status: 'in_progress',
          items: [
            { item_name: 'Bread', quantity: 2, category: 'Bakery' },
            { item_name: 'Milk', quantity: 1, category: 'Dairy' },
          ],
          notes: 'Being prepared for pickup',
        },
      ],
    };
  },
};

const RequestHistoryPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed, in_progress

  useEffect(() => {
    loadUserAndRequests();
  }, []);

  const loadUserAndRequests = async () => {
    try {
      // Check if user is authenticated
      const userResponse = await getCurrentUser();
      if (!userResponse.success) {
        navigate('/signup');
        return;
      }

      setUser(userResponse.data);

      // Load user requests
      const requestsResponse = await requestService.getUserRequests();
      if (requestsResponse.success) {
        setRequests(requestsResponse.data);
      } else {
        setError('Failed to load request history');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load request history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'in_progress':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const formatStatus = status => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your request history...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Request History</h1>
              <p className="text-gray-600">Track your food requests and their status</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/cart')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                View Cart
              </button>
              <button
                onClick={() => navigate('/browse-inventory')}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Browse Items
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-600 mr-2"
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
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'all', label: 'All Requests', count: requests.length },
              {
                key: 'pending',
                label: 'Pending',
                count: requests.filter(r => r.status === 'pending').length,
              },
              {
                key: 'in_progress',
                label: 'In Progress',
                count: requests.filter(r => r.status === 'in_progress').length,
              },
              {
                key: 'completed',
                label: 'Completed',
                count: requests.filter(r => r.status === 'completed').length,
              },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all'
                ? 'No requests yet'
                : `No ${formatStatus(filter).toLowerCase()} requests`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Start by browsing available food items and adding them to your cart.'
                : `You don't have any ${formatStatus(
                    filter
                  ).toLowerCase()} requests at the moment.`}
            </p>
            <button
              onClick={() => navigate('/browse-inventory')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition duration-200"
            >
              Browse Food Items
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map(request => (
              <div key={request._id} className="bg-white rounded-xl shadow-lg p-6">
                {/* Request Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Request #{request._id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Submitted on {new Date(request.request_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{formatStatus(request.status)}</span>
                    </span>
                  </div>
                </div>

                {/* Request Items */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Requested Items</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {request.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{item.item_name}</p>
                            <p className="text-sm text-gray-600">{item.category}</p>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Request Details */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">
                      Total Items:{' '}
                      <strong>{request.items.reduce((sum, item) => sum + item.quantity, 0)}</strong>
                    </span>
                    {request.fulfilled_date && (
                      <span className="text-gray-600">
                        Fulfilled: {new Date(request.fulfilled_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {request.notes && (
                    <div className="text-gray-600">
                      <span className="font-medium">Notes:</span> {request.notes}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                  {request.status === 'pending' && (
                    <button
                      onClick={() => {
                        // Implement cancel request functionality
                        alert('Cancel request functionality would be implemented here');
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Cancel Request
                    </button>
                  )}

                  <button
                    onClick={() => {
                      // Implement reorder functionality - add items back to cart
                      alert('Reorder functionality would be implemented here');
                    }}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                  >
                    Reorder Items
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {requests.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {requests.reduce(
                    (sum, req) =>
                      sum + req.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Items Requested</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default RequestHistoryPage;
