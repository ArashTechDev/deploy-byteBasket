// frontend/src/pages/SignInPage.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import SignInForm from '../components/forms/SignInForm';

const SignInPage = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [showEmailNotification, setShowEmailNotification] = useState(false);

  const handleToggleForm = (showNotification = false) => {
    // Navigate to sign up page when user wants to toggle
    if (onNavigate) {
      onNavigate('signup');
    } else {
      window.location.href = '/signup';
    }
    setShowEmailNotification(showNotification);
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <Header currentPage="signin" onNavigate={onNavigate} />

      {showEmailNotification && (
        <div className="max-w-md mx-auto pt-4 px-4">
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm text-center">
              {t('signIn.emailVerificationMessage') ||
                'Please check your email to verify your account.'}
            </p>
          </div>
        </div>
      )}

      <main className="py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            {t('Sign In') || 'Sign In'}
          </h1>

          <div className="bg-gray-600 rounded-lg p-8">
            <SignInForm onToggleForm={handleToggleForm} onNavigate={onNavigate} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignInPage;
