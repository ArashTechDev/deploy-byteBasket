// frontend/src/components/reports/StatCard.js
import React from 'react';

const StatCard = ({ title, value, icon, change, changeType, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
    yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
    red: 'bg-red-500 text-red-600 bg-red-50',
    purple: 'bg-purple-500 text-purple-600 bg-purple-50',
  };

  const [textColor, lightBg] = colorClasses[color].split(' ');

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={`text-sm ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              } mt-1`}
            >
              {changeType === 'positive' ? '↗' : '↘'} {change}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 ${lightBg} rounded-lg`}>
            <div className={`w-6 h-6 ${textColor}`}>{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
