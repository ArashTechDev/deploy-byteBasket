// frontend/src/components/forms/SignUpForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, resendVerificationEmail } from '../../services/authService';
import { useTranslation } from 'react-i18next';

const SignUpForm = ({ onToggleForm }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const [registrationState, setRegistrationState] = useState({
    isLoading: false,
    isSuccess: false,
    showResendButton: false,
    resendLoading: false,
    message: '',
  });

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert(t('signUpForm.passwordMismatch'));
      return;
    }

    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      alert(t('signUpForm.fillAllFields'));
      return;
    }

    setRegistrationState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await registerUser({
        name: formData.name,
        full_name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (response.success) {
        setRegistrationState({
          isLoading: false,
          isSuccess: true,
          showResendButton: true,
          resendLoading: false,
          message: t('signUpForm.registrationSuccess'),
        });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationState(prev => ({ ...prev, isLoading: false }));
      alert(error.response?.data?.message || error.message || t('signUpForm.registrationFailed'));
    }
  };

  const handleResendVerification = async () => {
    setRegistrationState(prev => ({ ...prev, resendLoading: true }));

    try {
      await resendVerificationEmail(formData.email);
      alert(t('signUpForm.verificationEmailSent'));
    } catch (error) {
      console.error('Resend verification error:', error);
      // Use existing translation key for resend failure
      alert(t('signUpForm.verificationEmailFailed'));
    } finally {
      setRegistrationState(prev => ({ ...prev, resendLoading: false }));
    }
  };

  if (registrationState.isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-400 text-lg font-semibold">
          {t('signUpForm.checkYourEmail')}
        </div>
        <p className="text-white text-sm">
          {t('signUpForm.verificationSentTo')} {formData.email}
        </p>
        <p className="text-gray-300 text-xs">{t('signUpForm.pleaseCheckInbox')}</p>
        <p className="text-gray-400 text-xs">{t('signUpForm.didntReceiveEmail')}</p>

        <div className="space-y-2">
          {registrationState.showResendButton && (
            <button
              onClick={handleResendVerification}
              disabled={registrationState.resendLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              {registrationState.resendLoading
                ? t('signUpForm.sending')
                : t('signUpForm.resendVerification')}
            </button>
          )}

          <button
            onClick={onToggleForm}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            {t('signUpForm.backToSignIn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          {t('signUpForm.roleLabel')}
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-500"
          required
        >
          <option value="">{t('signUpForm.chooseRole')}</option>
          <option value="donor">{t('signUpForm.roles.donor')}</option>
          <option value="volunteer">{t('signUpForm.roles.volunteer')}</option>
          <option value="recipient">{t('signUpForm.roles.recipient')}</option>
        </select>
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">
          {t('signUpForm.nameLabel')}
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={t('signUpForm.namePlaceholder')}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">
          {t('signUpForm.emailLabel')}
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={t('signUpForm.emailPlaceholder')}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">
          {t('signUpForm.passwordLabel')}
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={t('signUpForm.passwordPlaceholder')}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">
          {t('signUpForm.confirmPasswordLabel')}
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder={t('signUpForm.confirmPasswordPlaceholder')}
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
          {t('signUpForm.orSignIn')}
        </button>
      </div>

      <button
        type="submit"
        disabled={registrationState.isLoading}
        className="w-full bg-orange-400 hover:bg-orange-500 disabled:bg-gray-400 text-white py-3 rounded-md font-medium transition-colors"
      >
        {registrationState.isLoading ? t('signUpForm.creatingAccount') : t('signUpForm.submit')}
      </button>
    </form>
  );
};

export default SignUpForm;
