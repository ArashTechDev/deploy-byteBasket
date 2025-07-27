import React, { useState } from 'react';
import { registerUser, resendVerificationEmail } from '../../services/authService';

const SignUpForm = ({ onToggleForm, onNavigate }) => {
  const [formData, setFormData] = useState({
    role: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [registrationState, setRegistrationState] = useState({
    isRegistered: false,
    isLoading: false,
    userEmail: '',
    showResendButton: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistrationState(prev => ({ ...prev, isLoading: true }));

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      setRegistrationState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    if (!formData.role || !formData.name || !formData.email || !formData.password) {
      alert('Please fill all required fields');
      setRegistrationState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const payload = {
        role: formData.role,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      const response = await registerUser(payload);
      
      if (response.success) {
        setRegistrationState({
          isRegistered: true,
          isLoading: false,
          userEmail: formData.email,
          showResendButton: false
        });
        
        // Show success message
        alert(response.message || 'Registration successful! Please check your email to verify your account.');
        
        // Clear form
        setFormData({
          role: '',
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        
        // Show resend button after 30 seconds
        setTimeout(() => {
          setRegistrationState(prev => ({ ...prev, showResendButton: true }));
        }, 30000);
      }
    } catch (error) {
      console.error('Registration error:', error.response);
      setRegistrationState(prev => ({ ...prev, isLoading: false }));

      if (error.response?.data?.errors) {
        const messages = Object.values(error.response.data.errors)
          .map(err => err.message)
          .join('\n');
        alert(messages);
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Registration failed. Please try again.');
      }
    }
  };

  const handleResendVerification = async () => {
    setRegistrationState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await resendVerificationEmail(registrationState.userEmail);
      
      if (response.success) {
        alert('Verification email sent successfully! Please check your inbox.');
        setRegistrationState(prev => ({ 
          ...prev, 
          isLoading: false,
          showResendButton: false 
        }));
        
        // Show resend button again after 30 seconds
        setTimeout(() => {
          setRegistrationState(prev => ({ ...prev, showResendButton: true }));
        }, 30000);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setRegistrationState(prev => ({ ...prev, isLoading: false }));
      alert('Failed to resend verification email. Please try again.');
    }
  };

  // If user has registered, show verification message
  if (registrationState.isRegistered) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl">📧</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Check Your Email!</h3>
          <p className="text-sm">
            We've sent a verification email to <strong>{registrationState.userEmail}</strong>. 
            Please check your inbox and click the verification link to complete your registration.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Didn't receive the email? Check your spam folder or wait a few minutes.
          </p>
          
          {registrationState.showResendButton && (
            <button
              onClick={handleResendVerification}
              disabled={registrationState.isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              {registrationState.isLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          )}
          
          <button
            onClick={onToggleForm}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-white text-sm font-medium mb-2">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-500"
          required
        >
          <option value="">Choose Role</option>
          <option value="donor">Donor</option>
          <option value="volunteer">Volunteer</option>
          <option value="recipient">Recipient</option>
        </select>
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your full name"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Email address</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
          required
        />
      </div>

      <div className="text-right">
        <button
          type="button"
          onClick={onToggleForm}
          className="text-orange-400 text-sm hover:text-orange-300"
        >
          or Sign in!
        </button>
      </div>

      <button
        type="submit"
        disabled={registrationState.isLoading}
        className="w-full bg-orange-400 hover:bg-orange-500 disabled:bg-gray-400 text-white py-3 rounded-md font-medium transition-colors"
      >
        {registrationState.isLoading ? 'Creating Account...' : 'Submit'}
      </button>
    </form>
  );
};

export default SignUpForm;
