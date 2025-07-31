import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { loginUser } from '../../services/authService';
import { useTranslation } from 'react-i18next';

const SignInForm = ({ onToggleForm, onNavigate }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);
      localStorage.setItem('token', response.token);
      onNavigate('dashboard');
    } catch (err) {
      console.error('Login error response:', err.response);
      alert(err.response?.data?.message || t('signInForm.loginFailed'));
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          {t('signInForm.emailLabel')}
        </label>
        <input
          name="email"
          type="text"
          placeholder={t('signInForm.emailPlaceholder')}
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
          required
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
          {t('signInForm.orSignUp')}
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 rounded-md font-medium transition-colors"
      >
        {t('signInForm.submit')}
      </button>
    </form>
  );
};

SignInForm.propTypes = {
  onToggleForm: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default SignInForm;
