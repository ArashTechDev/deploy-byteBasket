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

  // Navigation handler for Header component
  const handleHeaderNavigation = (page) => {
    switch(page) {
      case 'volunteer':
        // Stay on volunteer page, go to landing
        setCurrentView('landing');
        break;
      case 'home':
      case 'dashboard':
      case 'signup':
      case 'contact':
      case 'donate':
        // Use the proper navigation function passed from App
        if (onNavigate) {
          onNavigate(page);
        } else {
          // Fallback for direct access (shouldn't happen in normal flow)
          console.warn('onNavigate not provided, using fallback navigation');
          window.location.href = page === 'home' ? '/' : `/${page}`;
        }
        break;
      default:
        // Unknown navigation - do nothing
        break;
    }
  };

  // Mock authentication check - replace with actual auth
  useEffect(() => {
    // Check if user is already registered volunteer
    const savedRegistration = localStorage.getItem('volunteerRegistered');
    const savedName = localStorage.getItem('volunteerName');
    if (savedRegistration) {
      setIsRegistered(true);
      setUserName(savedName || 'Volunteer');
      setCurrentView('schedule');
    }
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
    if (view === 'register' && isRegistered) {
      setCurrentView('schedule');
      return;
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
                  {isRegistered ? 'View Schedule' : 'Register'}
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