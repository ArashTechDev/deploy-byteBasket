import React from 'react';
import logo from '../../images/logo.png'; 

const Header = ({ currentPage, onNavigate }) => (
  <header className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        
        <div className="flex items-center space-x-2">
          <img 
            src={logo} 
            alt="ByteBasket Logo" 
            className="w-16 h-16 object-contain"
          />
          <div>
            <div className="text-lg font-bold text-teal-700">Byte</div>
            <div className="text-sm text-teal-600 -mt-1">basket</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="text-gray-700 hover:text-gray-900 font-medium"
          >
            Dashboard
          </button>
          <button 
            onClick={() => onNavigate('volunteer')}
            className="text-gray-700 hover:text-gray-900 font-medium"
          >
            Volunteer
          </button>
          <button 
            onClick={() => onNavigate('signup')}
            className={`font-medium ${currentPage === 'signup' ? 'text-orange-500' : 'text-gray-700 hover:text-gray-900'}`}
          >
            Sign Up
          </button>
          <button 
            onClick={() => onNavigate('contact')}
            className="text-gray-700 hover:text-gray-900 font-medium"
          >
            Contact Us
          </button>
        </nav>
        
        <button className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-2 rounded-full font-medium transition-colors">
          Donate now
        </button>
      </div>
    </div>
  </header>
);

export default Header;