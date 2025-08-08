// frontend/src/pages/RequestHistoryPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { getCurrentUser } from '../services/authService';
import foodRequestService from '../services/foodRequestService';

const RequestHistoryPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed, in_progress

  useEffect(() => {
    loadUserAndRequests();
  }, [filter]);

  const loadUserAndRequests = async () => {
    try {
      setLoading(true);

      // Load user data
      const userResponse = await getCurrentUser();
      if (userResponse && userResponse.success) {
        setUser(userResponse.data);
      } else {
        navigate('/signup');
        return;
      }

      // Load user's requests
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }

      const requestsResponse = await foodRequestService.getUserRequests(params);

      if (requestsResponse.success) {
        setRequests(requestsResponse.data);
      } else {
        throw new Error(requestsResponse.message || 'Failed to load requests');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message || 'Failed to load request history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = status => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      ready: 'bg-purple-100 text-purple-800',
      fulfilled: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDisplay = status => {
    const displays = {
      pending: 'Pending Review',
      approved: 'Approved',
      ready: 'Ready for Pickup',
      fulfilled: 'Completed',
      cancelled: 'Cancelled',
    };
    return displays[status.toLowerCase()] || status;
  };

  const handleReorder = request => {
    // TODO: Implement reorder functionality
    // This would add the items back to the cart
    alert('Reorder functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading your request history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Request History</h1>
          <p className="mt-2 text-gray-600">Track your food requests and their status</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">{error}</div>
        )}

        {/* Filter Controls */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'ready', 'fulfilled'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                  filter === status
                    ? 'bg-teal-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {status === 'all' ? 'All Requests' : getStatusDisplay(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {filter === 'all'
                ? "You haven't submitted any food requests yet."
                : `No ${getStatusDisplay(filter).toLowerCase()} requests found.`}
            </div>
            <button
              onClick={() => navigate('/browse-inventory')}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium transition duration-200"
            >
              Browse Available Items
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map(request => (
              <div
                key={request._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
              >
                <div className="p-6">
                  {/* Request Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Request #{request._id.slice(-8)}
                      </h3>
                      <p className="text-gray-600">
                        Submitted: {new Date(request.request_date).toLocaleDateString()}
                      </p>
                      {request.pickup_date && (
                        <p className="text-gray-600">
                          Pickup: {new Date(request.pickup_date).toLocaleDateString()} at{' '}
                          {request.pickup_time}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {getStatusDisplay(request.status)}
                    </span>
                  </div>

                  {/* Requested Items */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Requested Items:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {request.items.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{item.item_name}</span>
                            <span className="text-gray-600">×{item.quantity_requested}</span>
                          </div>
                          {item.dietary_category && (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full mt-1 inline-block">
                              {item.dietary_category}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {request.special_instructions && (
                      <div>
                        <span className="font-medium">Special Instructions:</span>{' '}
                        {request.special_instructions}
                      </div>
                    )}
                    {request.dietary_restrictions && (
                      <div>
                        <span className="font-medium">Dietary Restrictions:</span>{' '}
                        {request.dietary_restrictions}
                      </div>
                    )}
                    {request.allergies && (
                      <div>
                        <span className="font-medium">Allergies:</span> {request.allergies}
                      </div>
                    )}
                    {request.notes && (
                      <div>
                        <span className="font-medium">Notes:</span> {request.notes}
                      </div>
                    )}
                    {request.fulfilled_at && (
                      <div>
                        <span className="font-medium">Fulfilled:</span>{' '}
                        {new Date(request.fulfilled_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                    {request.status.toLowerCase() === 'fulfilled' && (
                      <button
                        onClick={() => handleReorder(request)}
                        className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                      >
                        Reorder Items
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/request-details/${request._id}`)}
                      className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {requests.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">{requests.length}</div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status.toLowerCase() === 'fulfilled').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    requests.filter(r =>
                      ['pending', 'approved', 'ready'].includes(r.status.toLowerCase())
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {requests.reduce(
                    (total, request) =>
                      total + request.items.reduce((sum, item) => sum + item.quantity_requested, 0),
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
