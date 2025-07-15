import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { getCurrentUser, logoutUser } from '../services/authService'; 

const sectionData = {
  admin: [
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
  ],
  donor: [
    {
      id: 'donate',
      title: 'Make a Donation',
      description: 'Quickly donate food, money, or resources.',
      icon: (
        <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.5 4 6 4c1.54 0 3.04.99 3.57 2.36h.87C14.46 4.99 15.96 4 17.5 4 20 4 21.5 6 21.5 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
    },
  ],
  volunteer: [
    {
      id: 'tasks',
      title: 'Assigned Tasks',
      description: 'View and manage your assigned volunteering tasks.',
      icon: (
        <svg className="w-10 h-10 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 11H7v2h2v-2zm0-4H7v2h2V7zm0 8H7v2h2v-2zm10-8h-8v2h8V7zm0 4h-8v2h8v-2zm0 4h-8v2h8v-2zM3 5v14h18V5H3zm16 12H5V7h14v10z" />
        </svg>
      ),
    },
  ],
};

const DashboardPage = ({ onNavigate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    localStorage.removeItem('token');
    onNavigate('home');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please log in.');
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await getCurrentUser();
        setUser(response.data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setError('Failed to fetch user data. Please log in again.');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">
        <svg
          className="animate-spin h-8 w-8 mx-auto mb-4 text-orange-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">
        <p>{error}</p>
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded"
        >
          Go to Home
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-10 text-red-600">
        User not found. Please log in again.
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const { role = 'donor', name = 'User' } = user;
  const sections = sectionData[role] || [];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header currentPage="dashboard" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome, {name}
            </h1>
            <p className="text-lg text-gray-500">
              Role: {role.charAt(0).toUpperCase() + role.slice(1)}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

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

export default DashboardPage;
