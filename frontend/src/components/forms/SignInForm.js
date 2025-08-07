import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { loginUser } from '../../services/authService';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../contexts/CartContext';

const SignInForm = ({ onToggleForm, onNavigate }) => {
  const { t } = useTranslation();
  const { refreshCart } = useCart();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login...');
      const response = await loginUser(formData);

      if (response.success && response.token) {
        console.log('Login successful, token stored');

        // Token is automatically stored by loginUser function
        // Refresh cart after successful login
        console.log('Refreshing cart after successful login...');

        // Small delay to ensure token storage is complete
        setTimeout(async () => {
          try {
            await refreshCart();
            console.log('Cart refreshed successfully');
          } catch (cartError) {
            console.log('Failed to refresh cart, but login was successful:', cartError.message);
            // Don't block navigation if cart refresh fails
          }

          // Navigate to dashboard
          onNavigate('dashboard');
        }, 150);
      } else {
        throw new Error(response.message || 'Login failed - no token received');
      }
    } catch (err) {
      console.error('Login error:', err);

      let errorMessage = 'Login failed. Please try again.';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Use translation if available, otherwise use error message
      setError(t ? t('signInForm.loginFailed', errorMessage) : errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-white text-sm font-medium mb-2">
          {t('signInForm.emailLabel')}
        </label>
        <input
          name="email"
          type="email"
          placeholder={t('signInForm.emailPlaceholder')}
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">
          {t('signInForm.passwordLabel')}
        </label>
        <input
          name="password"
          type="password"
          placeholder={t('signInForm.passwordPlaceholder')}
          value={formData.password}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
          disabled={isLoading}
        />
      </div>

      <div className="text-right">
        <button
          type="button"
          onClick={onToggleForm}
          className="text-orange-400 text-sm hover:text-orange-300 disabled:text-gray-400"
          disabled={isLoading}
        >
          {t('signInForm.orSignUp')}
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 rounded-md font-medium transition-colors ${
          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-400 hover:bg-orange-500'
        } text-white`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            Signing in...
          </div>
        ) : (
          t('signInForm.submit')
        )}
      </button>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-300 mt-2">
          <p>Cart integration: ✓ Enabled</p>
          <p>Token storage: ✓ Automatic</p>
        </div>
      )}
    </form>
  );
};

SignInForm.propTypes = {
  onToggleForm: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default SignInForm;
