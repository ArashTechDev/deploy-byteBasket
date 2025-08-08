import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Header from '../components/layout/Header';
import VolunteerForm from '../components/forms/VolunteerForm';
import ShiftCalendar from '../components/volunteer/ShiftCalendar';
import MyShiftsPanel from '../components/volunteer/MyShiftsPanel';
import { volunteerService } from '../services/volunteerService';
import { shiftService } from '../services/shiftService';
import { volunteerShiftService } from '../services/volunteerShiftService';
import { getFoodBanks } from '../services/foodBankService';
import './VolunteerPage.css';

const VolunteerPage = ({ onNavigate }) => {
  const { t } = useTranslation();

  const [currentView, setCurrentView] = useState('landing'); // landing, register, schedule, myshifts
  const [isRegistered, setIsRegistered] = useState(false);
  const [userShifts, setUserShifts] = useState([]);
  const [availableShifts, setAvailableShifts] = useState([]);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [userName, setUserName] = useState('');
  const [volunteerId, setVolunteerId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [foodbankId, setFoodbankId] = useState(null);
  const [foodBanks, setFoodBanks] = useState([]);
  const [foodBanksLoading, setFoodBanksLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Navigation handler for Header component
  const handleHeaderNavigation = (page) => {
    if (page === 'volunteer') {
      setCurrentView('landing');
      return;
    }
    
    if (onNavigate) {
      onNavigate(page);
    } else {
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

  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      localStorage.removeItem('volunteerRegistered');
      localStorage.removeItem('volunteerName');
      localStorage.removeItem('volunteerId');
      setIsRegistered(false);
      setUserName('');
      setUserShifts([]);
      setCurrentView('landing');
      setIsAuthenticated(false);
      return;
    }

    setIsAuthenticated(true);

    const savedRegistration = localStorage.getItem('volunteerRegistered');
    const savedName = localStorage.getItem('volunteerName');
    const savedVolunteerId = localStorage.getItem('volunteerId');
    const savedUserId = localStorage.getItem('userId');
    const savedFoodbankId = localStorage.getItem('foodbankId');

    if (savedRegistration && savedVolunteerId) {
      setIsRegistered(true);
      setUserName(savedName || t('volunteerPage.defaults.volunteer'));
      setVolunteerId(savedVolunteerId);
      setUserId(savedUserId || null);
      setFoodbankId(savedFoodbankId || null);
      setCurrentView('schedule');
      loadUserShifts(savedVolunteerId);
    } else {
      setUserId(savedUserId || null);
      setFoodbankId(savedFoodbankId || null);
    }

    // Load available food banks (for selection)
    const fetchFoodBanks = async () => {
      try {
        setFoodBanksLoading(true);
        const data = await getFoodBanks();
        // Normalize to ensure we have _id and name
        setFoodBanks(Array.isArray(data) ? data : []);
        // Auto-select if only one food bank and none selected yet
        if ((!savedFoodbankId || savedFoodbankId === 'null') && Array.isArray(data) && data.length === 1) {
          const only = data[0];
          setFoodbankId(only._id);
          localStorage.setItem('foodbankId', only._id);
        }
      } catch (e) {
        // Silently fail; user can still proceed but will see error on submit if needed
        console.error('Failed to load food banks', e);
      } finally {
        setFoodBanksLoading(false);
      }
    };
    fetchFoodBanks();

    loadAvailableShifts();
  }, [t]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        localStorage.removeItem('volunteerRegistered');
        localStorage.removeItem('volunteerName');
        localStorage.removeItem('volunteerId');
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

  const loadAvailableShifts = async () => {
    try {
      setLoading(true);
      const currentFoodbankId = localStorage.getItem('foodbankId');
      if (!currentFoodbankId) {
        throw new Error('No foodbank selected');
      }
      const response = await shiftService.getAvailableShifts(currentFoodbankId);
      const transformedShifts = shiftService.transformShiftsForCalendar(response.data);
      setAvailableShifts(transformedShifts);
    } catch {
      setAvailableShifts([
        {
          id: 'mock-1',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          time: '9:00 AM - 12:00 PM',
          activity: t('volunteerPage.mockShifts.foodSorting'),
          spotsAvailable: 3,
          totalSpots: 5,
          location: t('volunteerPage.mockShifts.mainWarehouse')
        },
        {
          id: 'mock-2',
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          time: '2:00 PM - 5:00 PM',
          activity: t('volunteerPage.mockShifts.foodDistribution'),
          spotsAvailable: 2,
          totalSpots: 4,
          location: t('volunteerPage.mockShifts.communityCenter')
        },
        {
          id: 'mock-3',
          date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
          time: '10:00 AM - 1:00 PM',
          activity: t('volunteerPage.mockShifts.inventoryManagement'),
          spotsAvailable: 4,
          totalSpots: 6,
          location: t('volunteerPage.mockShifts.mainWarehouse')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserShifts = async (volId) => {
    try {
      const response = await volunteerShiftService.getVolunteerShifts(volId);
      const apiShifts = Array.isArray(response?.data?.volunteer_shifts)
        ? response.data.volunteer_shifts
        : Array.isArray(response?.data)
          ? response.data
          : [];
      const transformedShifts = volunteerShiftService.transformVolunteerShifts(apiShifts);
      setUserShifts(transformedShifts);
    } catch {
      setUserShifts([]);
    }
  };

  const handleRegistrationSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const volunteerData = volunteerService.transformRegistrationData({
        ...formData,
        user_id: userId, // backend will default to req.user.id if missing
        foodbank_id: foodbankId
      });

      if (!foodbankId) {
        throw new Error(t('volunteerPage.errors.missingFoodbankId'));
      }

      const response = await volunteerService.createVolunteer(volunteerData);

      localStorage.setItem('volunteerRegistered', 'true');
      localStorage.setItem('volunteerName', formData.firstName);
      localStorage.setItem('volunteerId', response.data._id);

      setIsRegistered(true);
      setUserName(formData.firstName);
      setVolunteerId(response.data._id);
      setShowRegistrationSuccess(true);
      setCurrentView('schedule');

      setTimeout(() => setShowRegistrationSuccess(false), 5000);

    } catch (error) {
      setError(error.message || t('volunteerPage.errors.registerFail'));
    } finally {
      setLoading(false);
    }
  };

  const handleFoodbankChange = (e) => {
    const selectedId = e.target.value || null;
    setFoodbankId(selectedId);
    if (selectedId) {
      localStorage.setItem('foodbankId', selectedId);
    } else {
      localStorage.removeItem('foodbankId');
    }
  };

  const handleShiftSelect = async (shift) => {
    try {
      setLoading(true);
      setError(null);

      if (!volunteerId) {
        throw new Error(t('volunteerPage.errors.missingVolunteerId'));
      }
      if (!foodbankId) {
        throw new Error(t('volunteerPage.errors.missingFoodbankId'));
      }

      const assignmentData = volunteerShiftService.createShiftAssignment(
        volunteerId,
        shift.id,
        userId,
        foodbankId
      );

      await volunteerShiftService.assignVolunteerToShift(assignmentData);

      await loadUserShifts(volunteerId);

      alert(t('volunteerPage.alerts.successSignUp', { activity: shift.activity, date: shift.date }));
      setCurrentView('myshifts');

    } catch (error) {
      setError(error.message || t('volunteerPage.errors.signUpFail'));
      alert(t('volunteerPage.alerts.errorSignUp', { error: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelShift = async (shiftId) => {
    try {
      setLoading(true);
      setError(null);

      const volunteerShift = userShifts.find(shift => shift.id === shiftId);
      if (!volunteerShift) {
        throw new Error(t('volunteerPage.errors.shiftNotFound'));
      }

      await volunteerShiftService.cancelVolunteerShift(
        volunteerShift.id,
        t('volunteerPage.cancellation.cancelledByVolunteer'),
        userId
      );

      await loadUserShifts(volunteerId);

      alert(t('volunteerPage.alerts.shiftCancelled'));

    } catch (error) {
      setError(error.message || t('volunteerPage.errors.cancelFail'));
      alert(t('volunteerPage.alerts.errorCancel', { error: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (view) => {
    if (view === 'register') {
      if (!isAuthenticated) {
        if (onNavigate) {
          onNavigate('signup');
        }
        return;
      }
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
              <h1>{t('volunteerPage.landing.heroTitle')}</h1>

              <div className="impact-cards">
                <div className="impact-card">
                  <div className="impact-icon">🎯</div>
                  <h3>{t('volunteerPage.landing.impactCards.impact1.title')}</h3>
                  <p>{t('volunteerPage.landing.impactCards.impact1.description')}</p>
                </div>

                <div className="impact-card">
                  <div className="impact-icon">🤝</div>
                  <h3>{t('volunteerPage.landing.impactCards.impact2.title')}</h3>
                  <p>{t('volunteerPage.landing.impactCards.impact2.description')}</p>
                </div>

                <div className="impact-card">
                  <div className="impact-icon">🔄</div>
                  <h3>{t('volunteerPage.landing.impactCards.impact3.title')}</h3>
                  <p>{t('volunteerPage.landing.impactCards.impact3.description')}</p>
                </div>
              </div>

              <div className="cta-section">
                <button 
                  className="cta-button primary"
                  onClick={() => handleNavigation('register')}
                >
                  {isRegistered
                    ? t('volunteerPage.landing.buttons.primaryViewSchedule')
                    : (isAuthenticated
                      ? t('volunteerPage.landing.buttons.primaryRegister')
                      : t('volunteerPage.landing.buttons.primarySignInRegister')
                    )}
                </button>

                {isRegistered && (
                  <button
                    className="cta-button secondary"
                    onClick={() => setCurrentView('myshifts')}
                  >
                    {t('volunteerPage.landing.buttons.secondaryMyShifts')}
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case 'register':
        if (isRegistered) {
          return (
            <div className="registration-complete">
              <div className="success-message">
                <h2>✅ {t('volunteerPage.registration.alreadyRegisteredTitle')}</h2>
                <p>{t('volunteerPage.registration.alreadyRegisteredDescription')}</p>
                <button
                  className="cta-button"
                  onClick={() => setCurrentView('schedule')}
                >
                  {t('volunteerPage.registration.viewAvailableShiftsButton')}
                </button>
              </div>
            </div>
          );
        }
        return (
            <div className="registration-section">
            {error && <div className="error-message" style={{marginBottom: '1rem'}}>{error}</div>}
            <VolunteerForm 
              onSubmit={handleRegistrationSubmit}
              loading={loading}
              foodBanks={foodBanks}
              foodbankId={foodbankId}
              onFoodbankChange={handleFoodbankChange}
              foodBanksLoading={foodBanksLoading}
              onBack={() => setCurrentView('landing')}
            />
          </div>
        );

      case 'schedule':
        if (!isRegistered) {
          return (
            <div className="registration-required">
              <h2>{t('volunteerPage.registrationRequired.title')}</h2>
              <p>{t('volunteerPage.registrationRequired.description')}</p>
              <button
                className="cta-button"
                onClick={() => setCurrentView('register')}
              >
                {t('volunteerPage.registrationRequired.registerNow')}
              </button>
            </div>
          );
        }
        return (
          <div className="schedule-section">
            <div className="schedule-header">
              <button
                className="back-btn"
                onClick={() => setCurrentView('landing')}
              >
                ← {t('volunteerPage.buttons.backToHome')}
              </button>
              <div className="header-content">
                <h2>{t('volunteerPage.schedule.availableShiftsTitle')}</h2>
                <p>{t('volunteerPage.schedule.welcomeBack', { userName })}</p>
                {error && <div className="error-message">{error}</div>}
              </div>
              <button
                className="my-shifts-btn"
                onClick={() => setCurrentView('myshifts')}
              >
                {t('volunteerPage.schedule.myShifts')} ({(userShifts || []).filter(s => !['cancelled','completed'].includes(s.status)).length})
              </button>
            </div>
            {loading && <div className="loading-message">{t('volunteerPage.loading.loadingShifts')}</div>}
            <ShiftCalendar
              shifts={availableShifts}
              onShiftSelect={handleShiftSelect}
              selectedShifts={userShifts}
              userShifts={userShifts}
              loading={loading}
            />
          </div>
        );

      case 'myshifts':
        if (!isRegistered) {
          return (
            <div className="registration-required">
              <h2>{t('volunteerPage.registrationRequired.title')}</h2>
              <p>{t('volunteerPage.registrationRequired.description')}</p>
              <button
                className="cta-button"
                onClick={() => setCurrentView('register')}
              >
                {t('volunteerPage.registrationRequired.registerNow')}
              </button>
            </div>
          );
        }
        return (
          <div className="myshifts-section">
            <div className="myshifts-header">
              <button
                className="back-btn"
                onClick={() => setCurrentView('schedule')}
              >
                ← {t('volunteerPage.buttons.backToSchedule')}
              </button>
              <div className="header-actions">
                <button
                  className="schedule-btn"
                  onClick={() => setCurrentView('schedule')}
                >
                  + {t('volunteerPage.myShifts.scheduleMoreShifts')}
                </button>
              </div>
            </div>
            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading-message">{t('volunteerPage.loading.loadingUserShifts')}</div>}
            <MyShiftsPanel
              userShifts={userShifts}
              onCancelShift={handleCancelShift}
              loading={loading}
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
            <span>{t('volunteerPage.successBanner.welcomeMessage', { userName })}</span>
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
