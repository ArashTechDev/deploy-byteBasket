import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import SignUpForm from '../components/forms/SignUpForm';
import SignInForm from '../components/forms/SignInForm';

const SignUpPage = ({ onNavigate }) => {
  const { t } = useTranslation();

  const [isSignIn, setIsSignIn] = useState(false);
  const [showEmailNotification, setShowEmailNotification] = useState(false);
  
  const handleToggleForm = (showNotification = false) => {
    setIsSignIn(!isSignIn);
    setShowEmailNotification(showNotification);
  };
  
  return (
    <div className="min-h-screen bg-gray-200">
      <Header currentPage="signup" onNavigate={onNavigate} />
      
      {showEmailNotification && (
        <div className="max-w-md mx-auto pt-4 px-4">
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm text-center">
              {t('signUp.emailVerificationMessage')}
            </p>
          </div>
        </div>
      )}
      
      <main className="py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            {t('signUp.pageTitle')}
          </h1>
          
          <div className="bg-gray-600 rounded-lg p-8">
            {!isSignIn ? (
              <SignUpForm 
                onToggleForm={handleToggleForm} 
                onNavigate={onNavigate} 
              />
            ) : (
              <SignInForm 
                onToggleForm={handleToggleForm} 
                onNavigate={onNavigate} 
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;
