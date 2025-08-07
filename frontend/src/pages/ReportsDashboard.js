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
  const [filters, setFilters] = useState({});
  const [error, setError] = useState('');

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
      }
    } catch (error) {
      setError('Failed to load dashboard data');
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
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-gray-600">Monitor food bank operations and performance metrics</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            <div className="flex">
              <div className="flex-1">{error}</div>
              <button onClick={() => setError('')} className="ml-2 text-red-400 hover:text-red-600">
                ×
              </button>
            </div>
          </div>
        )}

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
        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard
                title="Total Inventory Items"
                value={dashboardData.quickStats.totalInventoryItems}
                color="blue"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                }
              />
              <StatCard
                title="Low Stock Items"
                value={dashboardData.quickStats.lowStockCount}
                color="yellow"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                }
              />
              <StatCard
                title="Today's Requests"
                value={dashboardData.quickStats.todayRequests}
                color="green"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                }
              />
              <StatCard
                title="Pending Requests"
                value={dashboardData.quickStats.pendingRequests}
                color="red"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <StatCard
                title="Today's Donations"
                value={dashboardData.quickStats.todayDonations}
                color="purple"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                }
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requests</h3>
                <div className="space-y-3">
                  {dashboardData.recentActivity.requests.length === 0 ? (
                    <p className="text-gray-500">No recent requests</p>
                  ) : (
                    dashboardData.recentActivity.requests.map(request => (
                      <div
                        key={request._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {request.recipient_id?.full_name || 'Unknown Recipient'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {request.items.length} items • {request.status}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h3>
                <div className="space-y-3">
                  {dashboardData.recentActivity.donations.length === 0 ? (
                    <p className="text-gray-500">No recent donations</p>
                  ) : (
                    dashboardData.recentActivity.donations.map(donation => (
                      <div
                        key={donation._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {donation.donor_id?.full_name || 'Anonymous Donor'}
                          </p>
                          <p className="text-sm text-gray-600">Status: {donation.status}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(donation.donation_date).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <ReportFilters filters={filters} onFilterChange={setFilters} showDateRange={false} />

            {inventoryReport && (
              <>
                {/* Inventory Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Items"
                    value={inventoryReport.summary.totalItems}
                    color="blue"
                  />
                  <StatCard
                    title="Total Quantity"
                    value={inventoryReport.summary.totalQuantity}
                    color="green"
                  />
                  <StatCard
                    title="Low Stock Items"
                    value={inventoryReport.summary.lowStockItems}
                    color="yellow"
                  />
                  <StatCard
                    title="Expiring Soon"
                    value={inventoryReport.summary.expiringSoon}
                    color="red"
                  />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Chart
                    type="pie"
                    title="Inventory by Category"
                    data={inventoryReport.categoryBreakdown.map(cat => ({
                      name: cat._id,
                      value: cat.totalQuantity,
                    }))}
                    dataKey="value"
                  />

                  <Chart
                    type="bar"
                    title="Low Stock by Category"
                    data={inventoryReport.categoryBreakdown.map(cat => ({
                      name: cat._id,
                      value: cat.lowStockCount,
                    }))}
                    dataKey="value"
                    xAxisKey="name"
                  />
                </div>

                {/* Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Low Stock Items</h3>
                      <button
                        onClick={() => handleExport('inventory')}
                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Export CSV
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Item
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Min Level
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {inventoryReport.lowStockItems.slice(0, 5).map(item => (
                            <tr key={item._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.item_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.minimum_stock_level}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Expiring Soon</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Item
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Expires
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Quantity
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {inventoryReport.expiringItems.slice(0, 5).map(item => (
                            <tr key={item._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.item_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(item.expiration_date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.quantity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            <ReportFilters filters={filters} onFilterChange={setFilters} />

            {requestReport && (
              <>
                {/* Request Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Requests"
                    value={requestReport.fulfillmentStats.totalRequests}
                    color="blue"
                  />
                  <StatCard
                    title="Fulfillment Rate"
                    value={`${requestReport.fulfillmentStats.fulfillmentRate}%`}
                    color="green"
                  />
                  <StatCard
                    title="Approval Rate"
                    value={`${requestReport.fulfillmentStats.approvalRate}%`}
                    color="purple"
                  />
                  <StatCard
                    title="Fulfilled Requests"
                    value={requestReport.fulfillmentStats.fulfilledRequests}
                    color="green"
                  />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Chart
                    type="pie"
                    title="Requests by Status"
                    data={requestReport.statusSummary.map(status => ({
                      name: status._id,
                      value: status.count,
                    }))}
                    dataKey="value"
                  />

                  <Chart
                    type="line"
                    title="Request Trends (Last 30 Days)"
                    data={requestReport.requestTrends.map(trend => ({
                      date: trend._id,
                      requests: trend.requestCount,
                      items: trend.itemCount,
                    }))}
                    dataKey="requests"
                    xAxisKey="date"
                    height={300}
                  />
                </div>

                {/* Popular Items Table */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Most Requested Items</h3>
                    <button
                      onClick={() => handleExport('requests')}
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Export CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Item Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Request Count
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Avg Quantity
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {requestReport.popularItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item._id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.requestCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.totalQuantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {Math.round(item.avgQuantity * 100) / 100}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Analytics</h3>
              <p className="text-gray-600">
                Advanced analytics features are coming soon. This will include:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
                <li>Predictive analytics for inventory needs</li>
                <li>Donor engagement insights</li>
                <li>Seasonal demand patterns</li>
                <li>Operational efficiency metrics</li>
                <li>Custom dashboard widgets</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsDashboard;
