// frontend/src/components/reports/StatCard.js
import React from 'react';

const StatCard = ({ title, value, icon, change, changeType, color = 'blue' }) => {
  const colorClasses = {
    blue: {
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-500',
    },
    green: {
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-500',
    },
    yellow: {
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-500',
    },
    red: {
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-500',
    },
    purple: {
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-500',
    },
    orange: {
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-500',
    },
  };

  // Get the color classes, fallback to blue if color is not found
  const colorClass = colorClasses[color] || colorClasses.blue;

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
          <div className={`p-3 ${colorClass.iconBg} rounded-lg`}>
            <div
              className={`w-6 h-6 ${colorClass.iconColor} flex items-center justify-center text-lg`}
            >
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
