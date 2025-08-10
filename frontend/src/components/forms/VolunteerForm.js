// frontend/src/components/forms/VolunteerForm.js
import React, { useState } from 'react';
import './VolunteerForm.css';

const VolunteerForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    skills: [],
    availability: [],
    experience: '',
    motivation: ''
  });

  const [errors, setErrors] = useState({});

  const skillOptions = [
    'Food Sorting',
    'Customer Service',
    'Administrative',
    'Event Planning',
    'Transportation',
    'Cooking',
    'Cleaning',
    'Fundraising',
    'Social Media',
    'Other'
  ];

  const availabilityOptions = [
    'Monday Morning',
    'Monday Afternoon',
    'Monday Evening',
    'Tuesday Morning',
    'Tuesday Afternoon',
    'Tuesday Evening',
    'Wednesday Morning',
    'Wednesday Afternoon',
    'Wednesday Evening',
    'Thursday Morning',
    'Thursday Afternoon',
    'Thursday Evening',
    'Friday Morning',
    'Friday Afternoon',
    'Friday Evening',
    'Saturday Morning',
    'Saturday Afternoon',
    'Saturday Evening',
    'Sunday Morning',
    'Sunday Afternoon',
    'Sunday Evening'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required';
    if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency phone is required';
    if (formData.skills.length === 0) newErrors.skills = 'Please select at least one skill';
    if (formData.availability.length === 0) newErrors.availability = 'Please select your availability';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="volunteer-form-container">
      <form onSubmit={handleSubmit} className="volunteer-form">
        <div className="welcome-header">
          <h2>Welcome to Our Community of Change-Makers!</h2>
          <p className="welcome-subtitle">
            Thank you for choosing to make a difference. Your compassion and dedication 
            help us fight hunger and build stronger communities. Let's get you started 
            on this meaningful journey together.
          </p>
          <div className="impact-highlight">
            <span className="highlight-icon">🌟</span>
            <span className="highlight-text">Every hour you volunteer feeds families and spreads hope</span>
          </div>
        </div>
        
        {/* Personal Information */}
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
                placeholder="Enter your first name"
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
                placeholder="Enter your last name"
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="Enter your phone number"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? 'error' : ''}
              placeholder="Enter your address"
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? 'error' : ''}
                placeholder="Enter your city"
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="postalCode">Postal Code *</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className={errors.postalCode ? 'error' : ''}
                placeholder="Enter postal code"
              />
              {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="form-section">
          <h3>Emergency Contact</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="emergencyContact">Emergency Contact Name *</label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className={errors.emergencyContact ? 'error' : ''}
                placeholder="Enter emergency contact name"
              />
              {errors.emergencyContact && <span className="error-message">{errors.emergencyContact}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="emergencyPhone">Emergency Phone *</label>
              <input
                type="tel"
                id="emergencyPhone"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                className={errors.emergencyPhone ? 'error' : ''}
                placeholder="Enter emergency phone number"
              />
              {errors.emergencyPhone && <span className="error-message">{errors.emergencyPhone}</span>}
            </div>
          </div>
        </div>

        {/* Skills & Availability */}
        <div className="form-section">
          <h3>Skills & Preferences</h3>
          <div className="form-group">
            <label>Skills & Interests *</label>
            <div className="checkbox-grid">
              {skillOptions.map(skill => (
                <label key={skill} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={skill}
                    checked={formData.skills.includes(skill)}
                    onChange={(e) => handleCheckboxChange(e, 'skills')}
                  />
                  {skill}
                </label>
              ))}
            </div>
            {errors.skills && <span className="error-message">{errors.skills}</span>}
          </div>

          <div className="form-group">
            <label>Availability *</label>
            <div className="checkbox-grid">
              {availabilityOptions.map(time => (
                <label key={time} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={time}
                    checked={formData.availability.includes(time)}
                    onChange={(e) => handleCheckboxChange(e, 'availability')}
                  />
                  {time}
                </label>
              ))}
            </div>
            {errors.availability && <span className="error-message">{errors.availability}</span>}
          </div>
        </div>

        {/* Additional Information */}
        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-group">
            <label htmlFor="experience">Previous Volunteer Experience</label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Tell us about your previous volunteer experience (optional)"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="motivation">Why do you want to volunteer with us?</label>
            <textarea
              id="motivation"
              name="motivation"
              value={formData.motivation}
              onChange={handleChange}
              placeholder="Share your motivation for volunteering (optional)"
              rows="4"
            />
          </div>
        </div>

        <button type="submit" className="submit-btn">Register as Volunteer</button>
      </form>
    </div>
  );
};

export default VolunteerForm;