import React, { useState } from 'react';
import { registerUser, resendVerificationEmail } from '../../services/authService';
import { useTranslation } from 'react-i18next';

const SignUpForm = ({ onToggleForm, onNavigate }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    role: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [registrationState, setRegistrationState] = useState({
    isRegistered: false,
    isLoading: false,
    userEmail: '',
    showResendButton: false,
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setRegistrationState(prev => ({ ...prev, isLoading: true }));

    if (formData.password !== formData.confirmPassword) {
      alert(t('signUpForm.passwordMismatch'));
      setRegistrationState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    if (!formData.role || !formData.name || !formData.email || !formData.password) {
      alert(t('signUpForm.fillAllFields'));
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
          showResendButton: false,
        });

        alert(response.message || t('signUpForm.registrationSuccess'));

        setFormData({
          role: '',
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
        });

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
        alert(t('signUpForm.registrationFailed'));
      }
    }
  };

  const handleResendVerification = async () => {
    setRegistrationState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await resendVerificationEmail(registrationState.userEmail);

      if (response.success) {
        alert(t('signUpForm.verificationEmailSent'));
        setRegistrationState(prev => ({
          ...prev,
          isLoading: false,
          showResendButton: false,
        }));

        setTimeout(() => {
          setRegistrationState(prev => ({ ...prev, showResendButton: true }));
        }, 30000);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setRegistrationState(prev => ({ ...prev, isLoading: false }));
      alert(t('signUpForm.verificationEmailFailed'));
    }
  };

  if (registrationState.isRegistered) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl">📧</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">{t('signUpForm.checkYourEmail')}</h3>
          <p className="text-sm">
            {t('signUpForm.verificationSentTo')} <strong>{registrationState.userEmail}</strong>.{' '}
            {t('signUpForm.pleaseCheckInbox')}
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">{t('signUpForm.didntReceiveEmail')}</p>

          {registrationState.showResendButton && (
            <button
              onClick={handleResendVerification}
              disabled={registrationState.isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              {registrationState.isLoading
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
