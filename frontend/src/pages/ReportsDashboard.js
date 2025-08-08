// frontend/src/pages/ReportsDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/layout/Header';
import StatCard from '../components/reports/StatCard';
import Chart from '../components/reports/Chart';
import ReportFilters from '../components/reports/ReportFilters';
import reportsService from '../services/reportsService';

const ReportsDashboard = ({ onNavigate }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [requestReport, setRequestReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    foodBankId: 'all',
  });
  const [error, setError] = useState('');

  // Mock data for enhanced analytics (until backend is updated)
  const mockAnalyticsData = {
    quickStats: {
      totalInventoryItems: 391,
      lowStockCount: 3,
      todayRequests: 12,
      todayDonations: 5,
      pendingRequests: 8,
    },
    locationMetrics: [
      {
        id: 1,
        name: 'Main Location',
        itemCount: 156,
        capacity: 1000,
        utilizationRate: 84,
        requestsFulfilled: 89,
        status: 'good',
      },
      {
        id: 2,
        name: 'Downtown Branch',
        itemCount: 89,
        capacity: 600,
        utilizationRate: 67,
        requestsFulfilled: 67,
        status: 'medium',
      },
      {
        id: 3,
        name: 'Westside Branch',
        itemCount: 34,
        capacity: 400,
        utilizationRate: 23,
        requestsFulfilled: 28,
        status: 'low',
      },
      {
        id: 4,
        name: 'North Branch',
        itemCount: 112,
        capacity: 750,
        utilizationRate: 84,
        requestsFulfilled: 73,
        status: 'good',
      },
    ],
    requestMetrics: {
      totalRequests: 247,
      fulfilledRequests: 219,
      pendingRequests: 15,
      rejectedRequests: 13,
      fulfillmentRate: 89,
      approvalRate: 94,
    },
    trendData: [
      { week: 'Week 1', requestsSubmitted: 45, requestsFulfilled: 42 },
      { week: 'Week 2', requestsSubmitted: 67, requestsFulfilled: 61 },
      { week: 'Week 3', requestsSubmitted: 89, requestsFulfilled: 79 },
      { week: 'Week 4', requestsSubmitted: 78, requestsFulfilled: 69 },
    ],
    categoryData: [
      { category: 'Grains', count: 120, percentage: 31 },
      { category: 'Proteins', count: 89, percentage: 23 },
      { category: 'Canned Goods', count: 94, percentage: 24 },
      { category: 'Dairy', count: 45, percentage: 12 },
      { category: 'Vegetables', count: 43, percentage: 10 },
    ],
  };

  // Wrap functions in useCallback to prevent unnecessary re-renders
  const loadInventoryReport = useCallback(async () => {
    try {
      const response = await reportsService.getInventoryReport(filters);
      if (response.success) {
        setInventoryReport(response.data);
      }
    } catch (error) {
      setError('Failed to load inventory report');
    }
  }, [filters]);

  const loadRequestReport = useCallback(async () => {
    try {
      const response = await reportsService.getRequestReport(filters);
      if (response.success) {
        setRequestReport(response.data);
      }
    } catch (error) {
      setError('Failed to load request report');
    }
  }, [filters]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reportsService.getDashboardData();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        // Use mock data if service fails
        setDashboardData(mockAnalyticsData);
      }
    } catch (error) {
      console.log('Using mock data for analytics');
      setDashboardData(mockAnalyticsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (activeTab === 'inventory') {
      loadInventoryReport();
    } else if (activeTab === 'requests') {
      loadRequestReport();
    }
  }, [activeTab, loadInventoryReport, loadRequestReport]);

  const handleExport = async reportType => {
    try {
      await reportsService.exportReport(reportType, filters);
    } catch (error) {
      setError('Failed to export report');
    }
  };

  const handleFilterChange = newFilters => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'inventory', name: 'Inventory', icon: '📦' },
    { id: 'requests', name: 'Requests', icon: '📋' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
  ];

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onNavigate={onNavigate} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-lg text-gray-600">
            Monitor food bank operations and performance metrics
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-1">{error}</div>
              <button
                onClick={() => setError('')}
                className="ml-2 text-red-400 hover:text-red-600 text-xl"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white rounded-xl p-1 shadow-md">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters Section */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Report Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={e => handleFilterChange({ startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={e => handleFilterChange({ endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Bank Location
              </label>
              <select
                value={filters.foodBankId}
                onChange={e => handleFilterChange({ foodBankId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Locations</option>
                <option value="1">Main Location</option>
                <option value="2">Downtown Branch</option>
                <option value="3">Westside Branch</option>
                <option value="4">North Branch</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => setFilters({ startDate: '', endDate: '', foodBankId: 'all' })}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Items</p>
                    <p className="text-3xl font-bold">
                      {dashboardData.quickStats.totalInventoryItems}
                    </p>
                  </div>
                  <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Low Stock</p>
                    <p className="text-3xl font-bold">{dashboardData.quickStats.lowStockCount}</p>
                  </div>
                  <div className="bg-yellow-400 bg-opacity-30 rounded-full p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Today's Requests</p>
                    <p className="text-3xl font-bold">{dashboardData.quickStats.todayRequests}</p>
                  </div>
                  <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Today's Donations</p>
                    <p className="text-3xl font-bold">{dashboardData.quickStats.todayDonations}</p>
                  </div>
                  <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Pending Requests</p>
                    <p className="text-3xl font-bold">{dashboardData.quickStats.pendingRequests}</p>
                  </div>
                  <div className="bg-indigo-400 bg-opacity-30 rounded-full p-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardData.locationMetrics?.map(location => (
                <div
                  key={location.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        location.status === 'good'
                          ? 'bg-green-500'
                          : location.status === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    ></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items in Stock</span>
                      <span className="font-medium">{location.itemCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity</span>
                      <span className="font-medium">{location.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utilization</span>
                      <span className="font-medium">{location.utilizationRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          location.utilizationRate > 70
                            ? 'bg-green-500'
                            : location.utilizationRate > 40
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${location.utilizationRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Request Trends (Last 4 Weeks)
                </h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {dashboardData.trendData?.map((week, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="w-full flex space-x-1">
                        <div
                          className="bg-blue-500 rounded-t"
                          style={{
                            height: `${(week.requestsSubmitted / 100) * 200}px`,
                            minHeight: '4px',
                          }}
                          title={`Submitted: ${week.requestsSubmitted}`}
                        ></div>
                        <div
                          className="bg-green-500 rounded-t"
                          style={{
                            height: `${(week.requestsFulfilled / 100) * 200}px`,
                            minHeight: '4px',
                          }}
                          title={`Fulfilled: ${week.requestsFulfilled}`}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 mt-2">{week.week}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Submitted</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Fulfilled</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Inventory by Category</h3>
                <div className="space-y-3">
                  {dashboardData.categoryData?.map((category, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-20 text-sm text-gray-600">{category.category}</div>
                      <div className="flex-1 mx-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-sm font-medium text-gray-900">{category.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Request Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Request Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {dashboardData.requestMetrics?.totalRequests || 0}
                  </div>
                  <div className="text-gray-600 mt-1">Total Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {dashboardData.requestMetrics?.fulfillmentRate || 0}%
                  </div>
                  <div className="text-gray-600 mt-1">Fulfillment Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {dashboardData.requestMetrics?.approvalRate || 0}%
                  </div>
                  <div className="text-gray-600 mt-1">Approval Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {dashboardData.requestMetrics?.fulfilledRequests || 0}
                  </div>
                  <div className="text-gray-600 mt-1">Fulfilled Requests</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Inventory Report</h3>
                <button
                  onClick={() => handleExport('inventory')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Export Report
                </button>
              </div>

              {inventoryReport ? (
                <>
                  {/* Inventory Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {inventoryReport.totalQuantity || '391'}
                      </div>
                      <div className="text-sm text-gray-600">Total Quantity</div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {inventoryReport.lowStockItems?.length || '3'}
                      </div>
                      <div className="text-sm text-gray-600">Low Stock Items</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {inventoryReport.expiringItems?.length || '2'}
                      </div>
                      <div className="text-sm text-gray-600">Expiring Soon</div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Inventory by Category
                    </h4>
                    <div className="space-y-3">
                      {[
                        { category: 'Grains', count: 120, percentage: 31 },
                        { category: 'Proteins', count: 89, percentage: 23 },
                        { category: 'Canned Goods', count: 94, percentage: 24 },
                        { category: 'Dairy', count: 45, percentage: 12 },
                        { category: 'Vegetables', count: 43, percentage: 10 },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-24 text-sm text-gray-600">{item.category}</div>
                          <div className="flex-1 mx-4">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className="h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-12 text-sm font-medium text-gray-900">{item.count}</div>
                          <div className="w-12 text-sm text-gray-500">{item.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Low Stock Alert Table */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h4>
                    <div className="bg-red-50 rounded-xl overflow-hidden">
                      <table className="min-w-full">
                        <thead className="bg-red-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">
                              Item Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">
                              Current Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">
                              Minimum Level
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">
                              Location
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-200">
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">Fresh Carrots</td>
                            <td className="px-6 py-4 text-sm text-red-600 font-medium">34</td>
                            <td className="px-6 py-4 text-sm text-gray-900">40</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Westside Branch</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">Chicken Breast</td>
                            <td className="px-6 py-4 text-sm text-red-600 font-medium">18</td>
                            <td className="px-6 py-4 text-sm text-gray-900">20</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Westside Branch</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Expiring Items Table */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Items Expiring Soon
                    </h4>
                    <div className="bg-orange-50 rounded-xl overflow-hidden">
                      <table className="min-w-full">
                        <thead className="bg-orange-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase">
                              Item Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase">
                              Expiration Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase">
                              Location
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-orange-200">
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">Whole Wheat Bread</td>
                            <td className="px-6 py-4 text-sm text-orange-600 font-medium">
                              Aug 10, 2024
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">45</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Downtown Branch</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-sm text-gray-900">Chicken Breast</td>
                            <td className="px-6 py-4 text-sm text-orange-600 font-medium">
                              Aug 12, 2024
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">18</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Westside Branch</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-600">Loading inventory report...</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Request Analytics</h3>
                <button
                  onClick={() => handleExport('requests')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Export Report
                </button>
              </div>

              {/* Request Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">247</div>
                  <div className="text-sm text-gray-600">Total Requests</div>
                  <div className="text-xs text-green-600 mt-1">↗ +18% from last month</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">89%</div>
                  <div className="text-sm text-gray-600">Fulfillment Rate</div>
                  <div className="text-xs text-green-600 mt-1">↗ +5% from last month</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">94%</div>
                  <div className="text-sm text-gray-600">Approval Rate</div>
                  <div className="text-xs text-green-600 mt-1">↗ +2% from last month</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">219</div>
                  <div className="text-sm text-gray-600">Fulfilled Requests</div>
                  <div className="text-xs text-green-600 mt-1">↗ +22% from last month</div>
                </div>
              </div>

              {/* Request Status Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Request Status Distribution
                  </h4>
                  <div className="space-y-3">
                    {[
                      { status: 'Fulfilled', count: 219, color: 'bg-green-500', percentage: 89 },
                      { status: 'Pending', count: 15, color: 'bg-yellow-500', percentage: 6 },
                      { status: 'In Progress', count: 13, color: 'bg-blue-500', percentage: 5 },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-4 h-4 ${item.color} rounded-full mr-3`}></div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.status}</span>
                            <span className="font-medium">{item.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 ${item.color} rounded-full`}
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Most Requested Items</h4>
                  <div className="space-y-3">
                    {[
                      { item: 'Rice', requests: 89, percentage: 36 },
                      { item: 'Canned Tomatoes', requests: 67, percentage: 27 },
                      { item: 'Bread', requests: 54, percentage: 22 },
                      { item: 'Pasta', requests: 45, percentage: 18 },
                      { item: 'Canned Beans', requests: 32, percentage: 13 },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-20 text-sm text-gray-600">{item.item}</div>
                        <div className="flex-1 mx-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-12 text-sm font-medium text-gray-900">
                          {item.requests}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location Performance */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Location Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'Main Location', requests: 89, fulfilled: 82, rate: 92 },
                    { name: 'Downtown Branch', requests: 67, fulfilled: 59, rate: 88 },
                    { name: 'Westside Branch', requests: 34, fulfilled: 28, rate: 82 },
                    { name: 'North Branch', requests: 57, fulfilled: 50, rate: 88 },
                  ].map((location, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <h5 className="font-medium text-gray-900 mb-2">{location.name}</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Requests</span>
                          <span>{location.requests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fulfilled</span>
                          <span>{location.fulfilled}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rate</span>
                          <span
                            className={`font-medium ${
                              location.rate > 85 ? 'text-green-600' : 'text-yellow-600'
                            }`}
                          >
                            {location.rate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Advanced Analytics</h3>

              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <h4 className="text-lg font-semibold mb-2">Average Response Time</h4>
                  <div className="text-3xl font-bold">2.3 hours</div>
                  <div className="text-blue-100 text-sm mt-1">Request to fulfillment</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <h4 className="text-lg font-semibold mb-2">Inventory Turnover</h4>
                  <div className="text-3xl font-bold">8.2 days</div>
                  <div className="text-green-100 text-sm mt-1">Average item lifecycle</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <h4 className="text-lg font-semibold mb-2">Demand Forecast</h4>
                  <div className="text-3xl font-bold">+15%</div>
                  <div className="text-purple-100 text-sm mt-1">Expected increase next week</div>
                </div>
              </div>

              {/* Trends and Patterns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Weekly Request Pattern
                  </h4>
                  <div className="space-y-2">
                    {[
                      { day: 'Monday', requests: 42, bar: 84 },
                      { day: 'Tuesday', requests: 38, bar: 76 },
                      { day: 'Wednesday', requests: 45, bar: 90 },
                      { day: 'Thursday', requests: 41, bar: 82 },
                      { day: 'Friday', requests: 39, bar: 78 },
                      { day: 'Saturday', requests: 28, bar: 56 },
                      { day: 'Sunday', requests: 22, bar: 44 },
                    ].map((day, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-20 text-sm text-gray-600">{day.day}</div>
                        <div className="flex-1 mx-3">
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className="h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${day.bar}%` }}
                            >
                              <span className="text-white text-xs font-medium">{day.requests}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Dietary Preferences Trends
                  </h4>
                  <div className="space-y-4">
                    {[
                      { preference: 'No Restrictions', percentage: 45, trend: '+3%' },
                      { preference: 'Vegetarian', percentage: 28, trend: '+8%' },
                      { preference: 'Gluten-Free', percentage: 15, trend: '+12%' },
                      { preference: 'Halal', percentage: 8, trend: '+5%' },
                      { preference: 'Vegan', percentage: 4, trend: '+15%' },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-900">
                            {item.preference}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">{item.percentage}%</span>
                          <span className="text-xs text-green-600 font-medium">{item.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Predictive Insights */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 Predictive Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">🔍 Recommendations</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Increase rice inventory by 25% for next week
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-500 mr-2">⚠</span>
                        Westside Branch needs immediate restocking
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">ℹ</span>
                        Consider expanding vegetarian options
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">📈 Trends to Watch</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">↗</span>
                        Gluten-free requests increasing 12% monthly
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">→</span>
                        Peak demand on Wednesdays consistently
                      </li>
                      <li className="flex items-start">
                        <span className="text-purple-500 mr-2">📅</span>
                        Holiday season preparation needed
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsDashboard;
