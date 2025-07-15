import React, { useState, useEffect } from 'react';
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { 
  isInFibApp, 
  authenticateWithNative, 
  addNativeEventListener, 
  removeNativeEventListener,
  NATIVE_EVENTS 
} from '../utils/fibBridge';
import axios from 'axios';
import './FibSplashScreen.css';

const FibSplashScreen = ({ onAuthenticationSuccess, onAuthenticationFailure }) => {
  const [status, setStatus] = useState('initializing'); // initializing, authenticating, success, failed
  const [error, setError] = useState('');
  const [ssoData, setSsoData] = useState(null);

  useEffect(() => {
    // Only proceed if we're actually in FIB app mode
    if (!isInFibApp()) {
      console.log('FibSplashScreen: Not in FIB app, skipping bridge operations');
      return;
    }

    console.log('FibSplashScreen: Starting FIB authentication process');

    // Set up event listeners for native app communication
    const handleAuthenticated = async (event) => {
      try {
        setStatus('success');
        
        // Get user details from backend using the SSO data
        if (ssoData && ssoData.ssoAuthorizationCode) {
          const response = await axios.get(`/api/auth/fib-sso/details/${ssoData.ssoAuthorizationCode}`);
          if (response.data && response.data.name) {
            const user = {
              username: ssoData.ssoAuthorizationCode,
              isFibUser: true,
              fibName: response.data.name,
              fibIban: response.data.iban,
              fibDob: response.data.dateOfBirth,
              fibPhone: response.data.phoneNumber,
              fibGender: response.data.Gender,
            };
            
            // Wait a moment to show success state, then proceed
            setTimeout(() => {
              onAuthenticationSuccess(user, null);
            }, 1500);
          }
        }
      } catch (error) {
        console.error('Error getting user details:', error);
        setStatus('failed');
        setError('Failed to get user details');
      }
    };

    const handleAuthenticationFailed = (event) => {
      setStatus('failed');
      setError('Authentication failed. Please try again.');
    };

    // Add event listeners
    addNativeEventListener(NATIVE_EVENTS.AUTHENTICATED, handleAuthenticated);
    addNativeEventListener(NATIVE_EVENTS.AUTHENTICATION_FAILED, handleAuthenticationFailed);

    // Start authentication process
    initiateAuthentication();

    // Cleanup event listeners
    return () => {
      removeNativeEventListener(NATIVE_EVENTS.AUTHENTICATED, handleAuthenticated);
      removeNativeEventListener(NATIVE_EVENTS.AUTHENTICATION_FAILED, handleAuthenticationFailed);
    };
  }, [ssoData, onAuthenticationSuccess, onAuthenticationFailure]);

  const initiateAuthentication = async () => {
    try {
      setStatus('authenticating');
      
      // Double-check we're in FIB mode before proceeding
      if (!isInFibApp()) {
        throw new Error('Not in FIB app mode');
      }
      
      // Get SSO authorization code from backend
      const response = await axios.post('/api/auth/fib-sso/initiate');
      if (response.data && response.data.ssoAuthorizationCode) {
        setSsoData(response.data);
        
        // Send authentication request to native app
        authenticateWithNative(response.data.ssoAuthorizationCode);
      } else {
        throw new Error('Failed to get SSO authorization code');
      }
    } catch (error) {
      console.error('Authentication initiation failed:', error);
      setStatus('failed');
      if (error.message === 'Not in FIB app mode') {
        setError('This feature is only available in the FIB app');
      } else {
        setError('Failed to start authentication process');
      }
    }
  };

  const handleRetry = () => {
    setStatus('authenticating');
    setError('');
    initiateAuthentication();
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'initializing':
        return 'Initializing...';
      case 'authenticating':
        return 'Authenticating with FIB...';
      case 'success':
        return 'Authentication successful!';
      case 'failed':
        return 'Authentication failed';
      default:
        return 'Loading...';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'initializing':
      case 'authenticating':
        return <FaSpinner className="spinner" />;
      case 'success':
        return <FaCheckCircle className="success-icon" />;
      case 'failed':
        return <FaExclamationTriangle className="error-icon" />;
      default:
        return <FaSpinner className="spinner" />;
    }
  };

  return (
    <div className="fib-splash-screen">
      <div className="splash-content">
        <div className="splash-logo">
          <img 
            src="https://fib.iq/wp-content/themes/FIB/assets/images/header-logo.svg" 
            alt="FIB Logo" 
            className="fib-logo-large" 
          />
        </div>
        
        <div className="splash-status">
          {getStatusIcon()}
          <h2>{getStatusMessage()}</h2>
          {status === 'authenticating' && (
            <p>Please authorize this login in your FIB Personal App</p>
          )}
          {status === 'failed' && (
            <div className="error-section">
              <p className="error-message">{error}</p>
              <button onClick={handleRetry} className="retry-btn">
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FibSplashScreen; 