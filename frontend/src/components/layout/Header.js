// frontend/src/components/layout/Header.js
// Use this version that works with your current setup

import React from 'react';
import logo from '../../images/logo.png'; 

const Header = ({ currentPage, onNavigate }) => {
  // Provide default functions if props are not passed
  const handleNavigation = onNavigate || ((page) => {
    // Default navigation - you can customize this
    switch(page) {
      case 'home':
        window.location.href = '/';
        break;
      case 'dashboard':
        window.location.href = '/dashboard';
        break;
      case 'volunteer':
        window.location.href = '/volunteer';
        break;
      case 'signup':
        window.location.href = '/signup';
        break;
      case 'contact':
        window.location.href = '/contact';
        break;
      case 'donate':
        window.location.href = '/donate';
        break;
      default:
        // Unknown page - do nothing
        break;
    }
  });

  const currentPageProp = currentPage || '';

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <button 
            onClick={() => handleNavigation('home')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <img 
              src={logo} 
              alt="ByteBasket Logo" 
              className="w-16 h-16 object-contain"
            />
            <div>
              <div className="text-lg font-bold text-teal-700">Byte</div>
              <div className="text-sm text-teal-600 -mt-1">basket</div>
            </div>
          </button>

          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNavigation('dashboard')}
              className={`font-medium ${currentPageProp === 'dashboard' ? 'text-orange-500' : 'text-gray-700 hover:text-gray-900'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => handleNavigation('volunteer')}
              className={`font-medium ${currentPageProp === 'volunteer' ? 'text-orange-500' : 'text-gray-700 hover:text-gray-900'}`}
            >
              Volunteer
            </button>
            <button 
              onClick={() => handleNavigation('signup')}
              className={`font-medium ${currentPageProp === 'signup' ? 'text-orange-500' : 'text-gray-700 hover:text-gray-900'}`}
            >
              Sign Up
            </button>
            <button 
              onClick={() => handleNavigation('contact')}
              className={`font-medium ${currentPageProp === 'contact' ? 'text-orange-500' : 'text-gray-700 hover:text-gray-900'}`}
            >
              Contact Us
            </button>
          </nav>
          
          <button 
            onClick={() => handleNavigation('donate')}
            className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-2 rounded-full font-medium transition-colors"
          >
            Donate now
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;