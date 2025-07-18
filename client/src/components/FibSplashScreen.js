import React, { useState, useEffect, useCallback } from 'react';
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import './FibSplashScreen.css';

const FibSplashScreen = ({ onAuthenticationSuccess, onAuthenticationFailure }) => {
  const [status, setStatus] = useState('initializing'); // initializing, authenticating, success, failed
  const [error, setError] = useState('');
  const [ssoData, setSsoData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Helper to remove hyphens
  const normalizeReadableId = (id) => id.replaceAll('-', '');

  // Handler for AUTHENTICATED event
  const handleAuthenticated = useCallback(async (event) => {
    setStatus('success');
    try {
      const readableId = ssoData?.ssoAuthorizationCode;
      if (!readableId) throw new Error('No readableId');
      // Get user details from backend
      const response = await axios.get(`/api/auth/fib-sso/details/${readableId}`);
      if (response.data && response.data.name) {
        const user = {
          username: readableId,
          isFibUser: true,
          fibName: response.data.name,
          fibIban: response.data.iban,
          fibDob: response.data.dateOfBirth,
          fibPhone: response.data.phoneNumber,
          fibGender: response.data.Gender,
        };
        setTimeout(() => {
          onAuthenticationSuccess(user, null);
        }, 1000);
      } else {
        throw new Error('Failed to get user details');
      }
    } catch (err) {
      setStatus('failed');
      setError('Failed to get user details');
    }
  }, [onAuthenticationSuccess, ssoData]);

  // Handler for AUTHENTICATION_FAILED event
  const handleAuthenticationFailed = useCallback(() => {
    setStatus('failed');
    setError('Authentication failed. Please try again.');
  }, []);

  // Register/unregister bridge event listeners
  useEffect(() => {
    if (!window.FIBNativeBridge) return;
    window.FIBNativeBridge.addEventListener('AUTHENTICATED', handleAuthenticated);
    window.FIBNativeBridge.addEventListener('AUTHENTICATION_FAILED', handleAuthenticationFailed);
    return () => {
      window.FIBNativeBridge.removeEventListener('AUTHENTICATED', handleAuthenticated);
      window.FIBNativeBridge.removeEventListener('AUTHENTICATION_FAILED', handleAuthenticationFailed);
    };
  }, [handleAuthenticated, handleAuthenticationFailed]);

  // Initiate SSO and send AUTHENTICATE to bridge
  const initiateFibSso = useCallback(async () => {
    setStatus('authenticating');
    setError('');
    setSsoData(null);
    try {
      const response = await axios.post('/api/auth/fib-sso/initiate');
      if (response.data && response.data.ssoAuthorizationCode) {
        setSsoData(response.data);
        // Send AUTHENTICATE to native app
        window.FIBNativeBridge.sendMessage({
          type: 'AUTHENTICATE',
          body: { readableId: normalizeReadableId(response.data.ssoAuthorizationCode) }
        });
      } else {
        throw new Error('Failed to initiate FIB SSO');
      }
    } catch (err) {
      setStatus('failed');
      setError('Failed to start authentication process');
    }
  }, []);

  // On mount or retry, start the SSO process
  useEffect(() => {
    if (window.FIBNativeBridge) {
      initiateFibSso();
    } else {
      setStatus('failed');
      setError('FIB Native Bridge not available.');
    }
    // eslint-disable-next-line
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    setStatus('authenticating');
    setError('');
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
            <p>Waiting for FIB app to authorize you...</p>
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