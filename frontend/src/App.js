import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import DonatePage from './pages/DonatePage';
import FoodbankPage from './pages/FoodBankManagerPage';
import InventoryPage from './pages/InventoryManagement';
import DashboardPage from './pages/Dashboard';
import VolunteerPage from './pages/VolunteerPage';
import ContactPage from './pages/ContactPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import Footer from './components/layout/Footer';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  
  // Check URL parameters on page load to handle direct links
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    const path = window.location.pathname;
    
    // Handle direct email verification links like /verify-email?token=...
    if (path === '/verify-email' || path.includes('verify-email')) {
      setCurrentPage('verify-email');
    }
    // Handle legacy URL format ?page=verify&token=...
    else if (pageParam === 'verify') {
      setCurrentPage('verify-email');
    }
    // Handle other page parameters
    else if (pageParam) {
      setCurrentPage(pageParam);
    }
  }, []);
  
  const navigate = (page) => {
    setCurrentPage(page);
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'signup':
        return <SignUpPage onNavigate={navigate} />;
      case 'donate':
        return <DonatePage onNavigate={navigate} />;
      case 'inventory':
        return <InventoryPage onNavigate={navigate} />;
      case 'foodbank':
        return <FoodbankPage onNavigate={navigate} />;
      case 'dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case 'volunteer':
        return <VolunteerPage onNavigate={navigate} />;
      case 'contact':
        return <ContactPage onNavigate={navigate} />;
      case 'verify-email':
        return <EmailVerificationPage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };
  
  return (
    <div className="App min-h-screen flex flex-col">
      <div className="flex-grow">
        {renderPage()}
      </div>
      <Footer />
    </div>
  );
};

export default App;