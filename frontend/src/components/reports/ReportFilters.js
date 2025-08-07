// frontend/src/components/reports/ReportFilters.js
import React from 'react';

const ReportFilters = ({ filters, onFilterChange, showDateRange = true, showFoodBank = true }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {showDateRange && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={e => onFilterChange({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={e => onFilterChange({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        {showFoodBank && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Food Bank</label>
            <select
              value={filters.foodbank_id || ''}
              onChange={e => onFilterChange({ ...filters, foodbank_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Food Banks</option>
              <option value="main">Main Location</option>
              <option value="branch1">Branch 1</option>
              <option value="branch2">Branch 2</option>
            </select>
          </div>
        )}

        <div className="flex items-end">
          <button
            onClick={() => onFilterChange({})}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
