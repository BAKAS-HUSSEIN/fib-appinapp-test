import React, { useState, useEffect, useCallback } from 'react';
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { 
  isFibBridgeAvailable, 
  addNativeEventListener, 
  removeNativeEventListener, 
  authenticateWithNative 
} from '../utils/fibBridge';
import './FibSplashScreen.css';

const FibSplashScreen = ({ onAuthenticationSuccess, onAuthenticationFailure }) => {
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState('');
  const [ssoData, setSsoData] = useState(null);

  // FIB API configuration
  const FIB_API_BASE = 'https://fib.stage.fib.iq/external/v1';
  const FIB_USERNAME = 'stageSSO';
  const FIB_PASSWORD = '215233bd-0624-4fba-98e7-3e3616fdbf08';

  // Create axios instance with basic auth
  const fibApi = axios.create({
    baseURL: FIB_API_BASE,
    auth: {
      username: FIB_USERNAME,
      password: FIB_PASSWORD
    }
  });

  // Handler for AUTHENTICATED event (following documentation exactly)
  const handleAuthenticated = useCallback(async (event) => {
    setStatus('success');
    try {
      const readableId = ssoData?.ssoAuthorizationCode;
      if (!readableId) throw new Error('No readableId');
      
      // Get user details from FIB API (following documentation exactly)
      const normalizedReadableId = readableId.replaceAll('-', '');
      const response = await fibApi.get(`/sso/${normalizedReadableId}/details`);
      
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
      setError('Failed to get user details. Please try again.');
    }
  }, [onAuthenticationSuccess, ssoData, fibApi]);

  // Handler for AUTHENTICATION_FAILED event (following documentation exactly)
  const handleAuthenticationFailed = useCallback(() => {
    setStatus('failed');
    setError('Authentication failed. Please try again.');
  }, []);

  // Register event listeners (following documentation exactly)
  useEffect(() => {
    if (!isFibBridgeAvailable()) return;

    addNativeEventListener('AUTHENTICATED', handleAuthenticated);
    addNativeEventListener('AUTHENTICATION_FAILED', handleAuthenticationFailed);

    return () => {
      removeNativeEventListener('AUTHENTICATED', handleAuthenticated);
      removeNativeEventListener('AUTHENTICATION_FAILED', handleAuthenticationFailed);
    };
  }, [handleAuthenticated, handleAuthenticationFailed]);

  // Initiate SSO flow (following documentation exactly)
  const initiateFibSso = useCallback(async () => {
    setStatus('authenticating');
    setError('');
    setSsoData(null);
    
    try {
      // Step 1: Call FIB API to initiate SSO
      const response = await fibApi.post('/sso');
      
      if (response.data && response.data.ssoAuthorizationCode) {
        setSsoData(response.data);
        
        // Step 2: Send AUTHENTICATE message to native app (following documentation exactly)
        if (isFibBridgeAvailable()) {
          authenticateWithNative(response.data.ssoAuthorizationCode);
        } else {
          throw new Error('FIB Native Bridge not available');
        }
      } else {
        throw new Error('Failed to initiate FIB SSO');
      }
    } catch (err) {
      setStatus('failed');
      setError('Failed to start authentication process. Please try again.');
    }
  }, [fibApi]);

  // Start SSO process on mount
  useEffect(() => {
    if (isFibBridgeAvailable()) {
      initiateFibSso();
    } else {
      setStatus('failed');
      setError('FIB Native Bridge not available.');
    }
  }, [initiateFibSso]);

  const handleRetry = () => {
    setStatus('authenticating');
    setError('');
    initiateFibSso();
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