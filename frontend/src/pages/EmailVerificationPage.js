// frontend/src/pages/EmailVerificationPage.js
import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { verifyEmail } from '../services/authService';

const EmailVerificationPage = ({ onNavigate }) => {
  const [verificationState, setVerificationState] = useState({
    isLoading: true,
    isSuccess: false,
    message: '',
    error: null
  });

  useEffect(() => {
    // Get token from URL parameters (without React Router)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      setVerificationState({
        isLoading: false,
        isSuccess: false,
        message: 'No verification token provided',
        error: 'Invalid verification link'
      });
      return;
    }

    // Verify email
    const handleVerification = async () => {
      try {
        console.log('🔄 Verifying email with token:', token);
        const response = await verifyEmail(token);
        console.log('✅ Verification response:', response);
        
        if (response.success) {
          setVerificationState({
            isLoading: false,
            isSuccess: true,
            message: response.message || 'Email verified successfully!',
            error: null
          });
        } else {
          setVerificationState({
            isLoading: false,
            isSuccess: false,
            message: response.message || 'Verification failed',
            error: 'Verification failed'
          });
        }
      } catch (error) {
        console.error('❌ Verification error:', error);
        setVerificationState({
          isLoading: false,
          isSuccess: false,
          message: error.response?.data?.message || 'An error occurred during verification',
          error: error.response?.data?.message || 'Verification failed'
        });
      }
    };

    handleVerification();
  }, []); // Run only once on component mount

  const handleNavigateToLogin = () => {
    if (onNavigate) {
      onNavigate('signup'); // This will show the sign-in form
    } else {
      window.location.href = '/signup';
    }
  };

  const handleNavigateToHome = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header currentPage="signup" onNavigate={onNavigate} />
      
      <main className="py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            
            {verificationState.isLoading && (
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800">Verifying your email...</h2>
                <p className="text-gray-600">Please wait while we verify your email address.</p>
              </div>
            )}

            {!verificationState.isLoading && verificationState.isSuccess && (
              <div className="text-center space-y-6">
                <div className="text-green-500 text-6xl mb-4">✓</div>
                <h2 className="text-2xl font-bold text-gray-800">Email Verified!</h2>
                <p className="text-gray-600 mb-6">{verificationState.message}</p>
                
                <div className="space-y-4">
                  <button
                    onClick={handleNavigateToLogin}
                    className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 rounded-md font-medium transition-colors"
                  >
                    Sign In Now
                  </button>
                  
                  <button
                    onClick={handleNavigateToHome}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-md font-medium transition-colors"
                  >
                    Go to Home
                  </button>
                </div>
              </div>
            )}

            {!verificationState.isLoading && !verificationState.isSuccess && (
              <div className="text-center space-y-6">
                <div className="text-red-500 text-6xl mb-4">✗</div>
                <h2 className="text-2xl font-bold text-gray-800">Verification Failed</h2>
                <p className="text-gray-600 mb-6">{verificationState.message}</p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-600">
                    This verification link may have expired or is invalid. 
                    Please try registering again or contact support if you continue to experience issues.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={handleNavigateToLogin}
                    className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 rounded-md font-medium transition-colors"
                  >
                    Try Signing In
                  </button>
                  
                  <button
                    onClick={handleNavigateToHome}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-md font-medium transition-colors"
                  >
                    Go to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailVerificationPage;
