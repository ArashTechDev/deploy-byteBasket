import React from 'react';
import Header from '../components/layout/Header';

const AdminDashboard = ({ onNavigate }) => {
  const sections = [
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'Manage inventory items, track donations and usage.',
      icon: (
        <svg className="w-10 h-10 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/>
        </svg>
      ),
    },
    {
      id: 'foodbank',
      title: 'Food Bank Locations',
      description: 'Add, update, or remove food bank locations.',
      icon: (
        <svg className="w-10 h-10 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header currentPage="admin" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-12 text-gray-800 text-center">Admin Dashboard</h1>
        
        <div className="grid gap-8 md:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow"
            >
              <div className="mb-4">{section.icon}</div>
              <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
              <p className="text-gray-600 mb-6">{section.description}</p>
              <button
                onClick={() => onNavigate(section.id)}
                className="bg-orange-400 text-white px-6 py-2 rounded-full hover:bg-orange-500 transition-colors"
              >
                Go to {section.title}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
