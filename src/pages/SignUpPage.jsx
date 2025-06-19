import React, { useState } from 'react';
import Header from '../components/layout/Header';
import SignUpForm from '../components/forms/SignUpForm';
import SignInForm from '../components/forms/SignInForm';

const SignUpPage = ({ onNavigate }) => {
  const [isSignIn, setIsSignIn] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-200">
      <Header currentPage="signup" onNavigate={onNavigate} />
      
      <main className="py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Sign up or Sign in
          </h1>
          
          <div className="bg-gray-600 rounded-lg p-8">
            {!isSignIn ? (
              <SignUpForm onToggleForm={() => setIsSignIn(true)} />
            ) : (
              <SignInForm onToggleForm={() => setIsSignIn(false)} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;
