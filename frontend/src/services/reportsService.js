// frontend/src/services/reportsService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const reportsService = {
  // Get dashboard data
  getDashboardData: async (foodbankId = null) => {
    const params = {};
    if (foodbankId) params.foodbank_id = foodbankId;

    const response = await axios.get(`${API_BASE_URL}/reports/dashboard`, { params });
    return response.data;
  },

  // Get inventory report
  getInventoryReport: async (filters = {}) => {
    const response = await axios.get(`${API_BASE_URL}/reports/inventory`, { params: filters });
    return response.data;
  },

  // Get request report
  getRequestReport: async (filters = {}) => {
    const response = await axios.get(`${API_BASE_URL}/reports/requests`, { params: filters });
    return response.data;
  },

  // Get donation report
  getDonationReport: async (filters = {}) => {
    const response = await axios.get(`${API_BASE_URL}/reports/donations`, { params: filters });
    return response.data;
  },

  // Get user report
  getUserReport: async (filters = {}) => {
    const response = await axios.get(`${API_BASE_URL}/reports/users`, { params: filters });
    return response.data;
  },

  // Export report
  exportReport: async (reportType, filters = {}) => {
    const params = { reportType, ...filters };
    const response = await axios.get(`${API_BASE_URL}/reports/export`, {
      params,
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  },
};

export default reportsService;
