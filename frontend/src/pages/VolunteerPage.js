// frontend/src/pages/VolunteerPage.js
import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import VolunteerForm from '../components/forms/VolunteerForm';
import ShiftCalendar from '../components/volunteer/ShiftCalendar';
import MyShiftsPanel from '../components/volunteer/MyShiftsPanel';
import './VolunteerPage.css';

const VolunteerPage = ({ onNavigate }) => {
  const [currentView, setCurrentView] = useState('landing'); // landing, register, schedule, myshifts
  const [isRegistered, setIsRegistered] = useState(false);
  const [userShifts, setUserShifts] = useState([]);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Navigation handler for Header component
  const handleHeaderNavigation = (page) => {
    if (page === 'volunteer') {
      // Show the volunteer landing page instead of staying on current view
      setCurrentView('landing');
      return;
    }
    
    // Use the onNavigate prop for all other navigation
    if (onNavigate) {
      onNavigate(page);
    } else {
      // Fallback to window location if onNavigate is not available
      switch(page) {
        case 'home':
          window.location.href = '/';
          break;
        case 'dashboard':
          window.location.href = '/dashboard';
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
          break;
      }
    }
  };

  // Authentication check - check for actual auth token
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // If no authentication token, clear volunteer data and reset state
    if (!token) {
      localStorage.removeItem('volunteerRegistered');
      localStorage.removeItem('volunteerName');
      setIsRegistered(false);
      setUserName('');
      setUserShifts([]);
      setCurrentView('landing');
      setIsAuthenticated(false);
      return;
    }
    
    // Set authentication state
    setIsAuthenticated(true);
    
    // If authenticated, check if user is already registered volunteer
    const savedRegistration = localStorage.getItem('volunteerRegistered');
    const savedName = localStorage.getItem('volunteerName');
    if (savedRegistration) {
      setIsRegistered(true);
      setUserName(savedName || 'Volunteer');
      setCurrentView('schedule');
    }
  }, []);

  // Listen for storage changes (logout from other tabs/pages)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed (logout occurred)
        localStorage.removeItem('volunteerRegistered');
        localStorage.removeItem('volunteerName');
        setIsRegistered(false);
        setUserName('');
        setUserShifts([]);
        setCurrentView('landing');
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleRegistrationSubmit = (formData) => {
    // Mock API call - replace with actual API
    setTimeout(() => {
      localStorage.setItem('volunteerRegistered', 'true');
      localStorage.setItem('volunteerName', formData.firstName);
      setIsRegistered(true);
      setUserName(formData.firstName);
      setShowRegistrationSuccess(true);
      setCurrentView('schedule');
      
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowRegistrationSuccess(false);
      }, 5000);
    }, 1000);
  };

  const handleShiftSelect = (shift) => {
    // Mock API call to sign up for shift
    const newShift = {
      ...shift,
      status: 'confirmed'
    };
    
    setUserShifts(prev => [...prev, newShift]);
    
    // Show confirmation and redirect to my shifts
    alert(`Successfully signed up for ${shift.activity} on ${shift.date}!`);
    setCurrentView('myshifts');
  };

  const handleCancelShift = (shiftId) => {
    // Mock API call to cancel shift
    setUserShifts(prev => prev.filter(shift => shift.id !== shiftId));
    
    // Show confirmation message
    alert('Shift cancelled successfully!');
  };

  const handleNavigation = (view) => {
    if (view === 'register') {
      // Check if user is signed in before allowing access to volunteer form
      if (!isAuthenticated) {
        // User is not signed in, redirect to sign up page
        if (onNavigate) {
          onNavigate('signup');
        }
        return;
      }
      
      // If user is already registered, go to schedule instead
      if (isRegistered) {
        setCurrentView('schedule');
        return;
      }
    }
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'landing':
        return (
          <div className="landing-section">
            <div className="hero-content">
              <h1>Explore the rewarding world of volunteering with us and be a part of the solution!</h1>
              
              <div className="impact-cards">
                <div className="impact-card">
                  <div className="impact-icon">🎯</div>
                  <h3>Meaningful Impact</h3>
                  <p>Contribute to the fight against hunger and help us provide essential nourishment to individuals and families facing food insecurity in our community.</p>
                </div>
                
                <div className="impact-card">
                  <div className="impact-icon">🤝</div>
                  <h3>Stronger Community</h3>
                  <p>Be a catalyst for positive change by fostering a sense of community and solidarity. Join like-minded individuals who share the common goal of creating a hunger-free future.</p>
                </div>
                
                <div className="impact-card">
                  <div className="impact-icon">🔄</div>
                  <h3>Flexible Opportunities</h3>
                  <p>We understand that your time is valuable. That's why we offer flexible volunteering options that fit your schedule, whether it's a few hours a week or a one-time event.</p>
                </div>
              </div>
              
              <div className="cta-section">
                <button 
                  className="cta-button primary"
                  onClick={() => handleNavigation('register')}
                >
                  {isRegistered ? 'View Schedule' : (isAuthenticated ? 'Register' : 'Sign In to Register')}
                </button>
                
                {isRegistered && (
                  <button 
                    className="cta-button secondary"
                    onClick={() => setCurrentView('myshifts')}
                  >
                    My Shifts
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      
case 'register':
  return (
    <div className="form-section">
      <VolunteerForm onSubmit={handleRegistrationSubmit} />
    </div>
  );
      
      case 'schedule':
        return (
          <div className="schedule-section">
            <div className="schedule-header">
              <button 
                className="back-btn"
                onClick={() => setCurrentView('landing')}
              >
                ← Back to Home
              </button>
              <div className="header-content">
                <h2>Available Volunteer Shifts</h2>
                <p>Welcome back, {userName}! Select a date to view and sign up for shifts.</p>
              </div>
              <button 
                className="my-shifts-btn"
                onClick={() => setCurrentView('myshifts')}
              >
                My Shifts ({userShifts.length})
              </button>
            </div>
            <ShiftCalendar 
              onShiftSelect={handleShiftSelect}
              selectedShifts={userShifts}
              userShifts={userShifts}
            />
          </div>
        );
      
      case 'myshifts':
        return (
          <div className="myshifts-section">
            <div className="myshifts-header">
              <button 
                className="back-btn"
                onClick={() => setCurrentView('schedule')}
              >
                ← Back to Schedule
              </button>
              <div className="header-actions">
                <button 
                  className="schedule-btn"
                  onClick={() => setCurrentView('schedule')}
                >
                  + Schedule More Shifts
                </button>
              </div>
            </div>
            <MyShiftsPanel 
              userShifts={userShifts}
              onCancelShift={handleCancelShift}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="volunteer-page">
      <Header 
        currentPage="volunteer"
        onNavigate={handleHeaderNavigation}
      />
      
      {showRegistrationSuccess && (
        <div className="success-banner">
          <div className="success-content">
            <span className="success-icon">🎉</span>
            <span>Welcome to our volunteer community, {userName}! You can now sign up for shifts.</span>
            <button 
              className="close-banner"
              onClick={() => setShowRegistrationSuccess(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="volunteer-container">
        {renderContent()}
      </div>
    </div>
  );
};

export default VolunteerPage;