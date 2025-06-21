// frontend/src/components/inventory/InventoryDashboard.jsx
import React from 'react';
import { Package, AlertTriangle, Calendar, TrendingDown } from 'lucide-react';

const InventoryDashboard = ({ stats }) => {
  const cards = [
    {
      title: 'Total Items',
      value: stats?.totalItems || 0,
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.lowStockCount || 0,
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Expiring Soon',
      value: stats?.expiringSoonCount || 0,
      icon: Calendar,
      color: 'yellow'
    },
    {
      title: 'Categories',
      value: stats?.categoriesCount || 0,
      icon: TrendingDown,
      color: 'green'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const colorClasses = {
          blue: 'bg-blue-500',
          red: 'bg-red-500',
          yellow: 'bg-yellow-500',
          green: 'bg-green-500'
        };

        return (
          <div key={card.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${colorClasses[card.color]} text-white`}>
                <Icon size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryDashboard;