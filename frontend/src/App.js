import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import DonatePage from './pages/DonatePage';
import Footer from './components/layout/Footer';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  
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