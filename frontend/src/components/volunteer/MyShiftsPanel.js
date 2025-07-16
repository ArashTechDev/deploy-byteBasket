// frontend/src/components/volunteer/MyShiftsPanel.js
import React, { useState, useEffect } from 'react';
import './MyShiftsPanel.css';

const MyShiftsPanel = ({ userShifts = [], onCancelShift }) => {
  const [totalHours, setTotalHours] = useState(0);
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [pastShifts, setPastShifts] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [shiftToCancel, setShiftToCancel] = useState(null);

  // Mock data - replace with actual API call
  const mockUserShifts = [
    {
      id: 1,
      date: '2025-02-19',
      time: '9:00 AM - 12:00 PM',
      activity: 'Maintain inventory',
      location: 'Main Warehouse',
      hours: 3,
      status: 'confirmed'
    },
    {
      id: 2,
      date: '2025-02-22',
      time: '1:00 PM - 4:00 PM',
      activity: 'Food distribution',
      location: 'Community Center',
      hours: 3,
      status: 'confirmed'
    },
    {
      id: 3,
      date: '2025-01-15',
      time: '10:00 AM - 2:00 PM',
      activity: 'Training session',
      location: 'Main Office',
      hours: 4,
      status: 'completed'
    },
    {
      id: 4,
      date: '2025-01-20',
      time: '9:00 AM - 12:00 PM',
      activity: 'Administrative tasks',
      location: 'Main Office',
      hours: 3,
      status: 'completed'
    }
  ];

  useEffect(() => {
    const shifts = userShifts.length > 0 ? userShifts : mockUserShifts;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [];
    const past = [];
    let hours = 0;

    shifts.forEach(shift => {
      const shiftDate = new Date(shift.date);
      shiftDate.setHours(0, 0, 0, 0);

      if (shiftDate >= today && shift.status !== 'cancelled') {
        upcoming.push(shift);
      } else if (shift.status === 'completed') {
        past.push(shift);
        hours += shift.hours;
      }
    });

    // Sort upcoming shifts by date
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    // Sort past shifts by date (most recent first)
    past.sort((a, b) => new Date(b.date) - new Date(a.date));

    setUpcomingShifts(upcoming);
    setPastShifts(past);
    setTotalHours(hours);
  }, [userShifts]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCancelClick = (shift) => {
    setShiftToCancel(shift);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (onCancelShift && shiftToCancel) {
      onCancelShift(shiftToCancel.id);
    }
    setShowCancelModal(false);
    setShiftToCancel(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { class: 'status-confirmed', text: 'Confirmed' },
      completed: { class: 'status-completed', text: 'Completed' },
      cancelled: { class: 'status-cancelled', text: 'Cancelled' }
    };
    
    const badge = badges[status] || { class: 'status-pending', text: 'Pending' };
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const getDaysUntilShift = (dateString) => {
    const today = new Date();
    const shiftDate = new Date(dateString);
    const diffTime = shiftDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `In ${diffDays} days`;
    return 'Past';
  };

  return (
    <div className="my-shifts-container">
      <div className="shifts-header">
        <h2>My Volunteer Schedule</h2>
        <div className="hours-summary">
          <div className="hours-badge">
            <span className="hours-number">{totalHours}</span>
            <span className="hours-label">Hours Completed</span>
          </div>
        </div>
      </div>

      <div className="shifts-content">
        {/* Upcoming Shifts */}
        <div className="shifts-section">
          <h3>Upcoming Shifts</h3>
          {upcomingShifts.length === 0 ? (
            <div className="empty-state">
              <p>No upcoming shifts scheduled.</p>
              <p>Check the calendar to sign up for volunteer opportunities!</p>
            </div>
          ) : (
            <div className="shifts-list">
              {upcomingShifts.map(shift => (
                <div key={shift.id} className="shift-card upcoming">
                  <div className="shift-main-info">
                    <div className="shift-date-time">
                      <h4>{formatDate(shift.date)}</h4>
                      <p className="shift-time">{shift.time}</p>
                      <span className="days-until">{getDaysUntilShift(shift.date)}</span>
                    </div>
                    <div className="shift-details">
                      <h5>{shift.activity}</h5>
                      <p className="shift-location">📍 {shift.location}</p>
                      <p className="shift-duration">⏱️ {shift.hours} hours</p>
                    </div>
                  </div>
                  <div className="shift-actions">
                    {getStatusBadge(shift.status)}
                    <button 
                      className="cancel-btn"
                      onClick={() => handleCancelClick(shift)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Shifts */}
        <div className="shifts-section">
          <h3>Recent Activity</h3>
          {pastShifts.length === 0 ? (
            <div className="empty-state">
              <p>No completed shifts yet.</p>
            </div>
          ) : (
            <div className="shifts-list">
              {pastShifts.slice(0, 5).map(shift => (
                <div key={shift.id} className="shift-card past">
                  <div className="shift-main-info">
                    <div className="shift-date-time">
                      <h4>{formatDate(shift.date)}</h4>
                      <p className="shift-time">{shift.time}</p>
                    </div>
                    <div className="shift-details">
                      <h5>{shift.activity}</h5>
                      <p className="shift-location">📍 {shift.location}</p>
                      <p className="shift-duration">⏱️ {shift.hours} hours</p>
                    </div>
                  </div>
                  <div className="shift-actions">
                    {getStatusBadge(shift.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activities Summary */}
        <div className="activities-summary">
          <h3>Activities Tracked</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">📦</span>
              <span className="activity-name">Maintain inventory</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">🎓</span>
              <span className="activity-name">Training session</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Shift</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCancelModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              {shiftToCancel && (
                <>
                  <p>Are you sure you want to cancel this shift?</p>
                  <div className="shift-summary">
                    <h4>{shiftToCancel.activity}</h4>
                    <p>{formatDate(shiftToCancel.date)}</p>
                    <p>{shiftToCancel.time}</p>
                  </div>
                  <p className="cancel-warning">
                    Please cancel at least 24 hours in advance when possible.
                  </p>
                </>
              )}
              <div className="modal-actions">
                <button 
                  className="cancel-confirm-btn"
                  onClick={confirmCancel}
                >
                  Yes, Cancel Shift
                </button>
                <button 
                  className="cancel-back-btn"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyShiftsPanel;