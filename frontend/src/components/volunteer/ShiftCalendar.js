// frontend/src/components/volunteer/ShiftCalendar.js
import React, { useState, useEffect } from 'react';
import './ShiftCalendar.css';

const ShiftCalendar = ({ onShiftSelect, selectedShifts = [], userShifts = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState([]);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableShifts, setAvailableShifts] = useState([]);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockShifts = [
      {
        id: 1,
        date: '2025-02-19',
        time: '9:00 AM - 12:00 PM',
        activity: 'Maintain inventory',
        spotsAvailable: 3,
        totalSpots: 5
      },
      {
        id: 2,
        date: '2025-02-19',
        time: '1:00 PM - 4:00 PM',
        activity: 'Training session',
        spotsAvailable: 2,
        totalSpots: 4
      },
      {
        id: 3,
        date: '2025-02-20',
        time: '10:00 AM - 1:00 PM',
        activity: 'Food distribution',
        spotsAvailable: 4,
        totalSpots: 6
      },
      {
        id: 4,
        date: '2025-02-21',
        time: '2:00 PM - 5:00 PM',
        activity: 'Administrative tasks',
        spotsAvailable: 1,
        totalSpots: 3
      },
      {
        id: 5,
        date: '2025-02-22',
        time: '9:00 AM - 12:00 PM',
        activity: 'Maintain inventory',
        spotsAvailable: 5,
        totalSpots: 5
      },
      // Add more dates to current month for testing
      {
        id: 6,
        date: formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1),
        time: '10:00 AM - 2:00 PM',
        activity: 'Food sorting',
        spotsAvailable: 2,
        totalSpots: 4
      },
      {
        id: 7,
        date: formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3),
        time: '2:00 PM - 6:00 PM',
        activity: 'Community outreach',
        spotsAvailable: 3,
        totalSpots: 5
      }
    ];
    setShifts(mockShifts);
    console.log('Mock shifts loaded:', mockShifts); // Debug log
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getShiftsForDate = (date) => {
    return shifts.filter(shift => shift.date === date);
  };

  const isUserScheduled = (date) => {
    return userShifts.some(shift => shift.date === date);
  };

  const hasAvailableShifts = (date) => {
    const dayShifts = getShiftsForDate(date);
    return dayShifts.some(shift => shift.spotsAvailable > 0);
  };

  const handleDateClick = (day) => {
    if (!day) return;
    
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayShifts = getShiftsForDate(dateStr);
    
    console.log('Date clicked:', dateStr, 'Shifts found:', dayShifts); // Debug log
    
    if (dayShifts.length > 0) {
      setSelectedDate(dateStr);
      setAvailableShifts(dayShifts);
      setShowShiftModal(true);
    } else {
      // Show a message for dates with no shifts
      alert(`No shifts available on ${dateStr}. Try clicking on dates with colored indicators!`);
    }
  };

  const handleShiftSelect = (shift) => {
    if (onShiftSelect) {
      onShiftSelect(shift);
    }
    setShowShiftModal(false);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const isToday = (day) => {
    return day && 
           currentDate.getFullYear() === today.getFullYear() &&
           currentDate.getMonth() === today.getMonth() &&
           day === today.getDate();
  };

  return (
    <div className="shift-calendar-container">
      <div className="calendar-header">
        <button 
          className="nav-btn"
          onClick={() => navigateMonth(-1)}
          aria-label="Previous month"
        >
          &#8249;
        </button>
        <h2 className="month-year">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button 
          className="nav-btn"
          onClick={() => navigateMonth(1)}
          aria-label="Next month"
        >
          &#8250;
        </button>
      </div>

      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="empty-cell"></div>;
          }
          
          const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
          const hasShifts = hasAvailableShifts(dateStr);
          const isScheduled = isUserScheduled(dateStr);
          const isTodayCell = isToday(day);
          
          return (
            <div 
              key={day}
              className={`calendar-day ${hasShifts ? 'has-shifts' : ''} ${isScheduled ? 'scheduled' : ''} ${isTodayCell ? 'today' : ''}`}
              onClick={() => handleDateClick(day)}
              style={{ cursor: hasShifts ? 'pointer' : 'default' }}
            >
              <span className="day-number">{day}</span>
              {hasShifts && (
                <div className="shift-indicators">
                  {getShiftsForDate(dateStr).map(shift => (
                    <div 
                      key={shift.id}
                      className={`shift-dot ${shift.spotsAvailable === 0 ? 'full' : ''}`}
                      title={`${shift.activity} - ${shift.time}`}
                    />
                  ))}
                </div>
              )}
              {isScheduled && <div className="scheduled-indicator">✓</div>}
            </div>
          );
        })}
      </div>

      {showShiftModal && (
        <div className="modal-overlay" onClick={() => setShowShiftModal(false)}>
          <div className="shift-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Available Shifts - {selectedDate}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowShiftModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              {availableShifts.map(shift => (
                <div key={shift.id} className="shift-option">
                  <div className="shift-info">
                    <h4>{shift.activity}</h4>
                    <p className="shift-time">{shift.time}</p>
                    <p className="shift-spots">
                      {shift.spotsAvailable} of {shift.totalSpots} spots available
                    </p>
                  </div>
                  <button 
                    className={`select-shift-btn ${shift.spotsAvailable === 0 ? 'disabled' : ''}`}
                    onClick={() => handleShiftSelect(shift)}
                    disabled={shift.spotsAvailable === 0}
                  >
                    {shift.spotsAvailable === 0 ? 'Full' : 'Sign Up'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftCalendar;