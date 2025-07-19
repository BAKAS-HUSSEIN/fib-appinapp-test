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
  const [status, setStatus] = useState('initializing'); // initializing, authenticating, success, failed
  const [error, setError] = useState('');
  const [ssoData, setSsoData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Server-side logging function
  const logToServer = (message, data = null) => {
    console.log(`[FIB MODE] ${message}`, data);
    // Send log to server for debugging
    axios.post('/api/logs/fib', {
      message: `[FIB MODE] ${message}`,
      data: data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }).catch(err => {
      // Silently fail if logging fails
      console.log('Failed to log to server:', err.message);
    });
  };

  // Handler for AUTHENTICATED event
  const handleAuthenticated = useCallback(async (event) => {
    logToServer('AUTHENTICATED event received', event);
    setStatus('success');
    
    try {
      const readableId = ssoData?.ssoAuthorizationCode;
      if (!readableId) throw new Error('No readableId');
      
      logToServer('Starting user details retrieval process');
      
      // Wait for native app to complete authentication (5 seconds delay instead of 3)
      logToServer('Waiting 5 seconds for native app to complete authentication...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Get user details from backend using the readableId (without hyphens)
      const normalizedReadableId = readableId.replaceAll('-', '');
      logToServer('Getting user details for readableId', normalizedReadableId);
      
      const response = await axios.get(`/api/auth/fib-sso/details/${normalizedReadableId}`);
      
      if (response.data && response.data.name) {
        const user = {
          username: readableId,
          isFibUser: true,
          fibName: response.data.name,
          fibIban: response.data.iban,
          fibDob: response.data.dateOfBirth,
          fibPhone: response.data.phoneNumber,
          fibGender: response.data.Gender || response.data.gender,
        };
        logToServer('User authenticated successfully', user);
        setTimeout(() => {
          onAuthenticationSuccess(user, null);
        }, 1000);
      } else {
        throw new Error('Failed to get user details - no name in response');
      }
    } catch (err) {
      logToServer('Error getting user details', {
        error: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setStatus('failed');
      if (err.response?.status === 401) {
        setError('Authentication failed. Please check FIB credentials.');
      } else if (err.response?.status === 404) {
        setError('User details not found. Please try again.');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please try again later.');
      } else if (err.response?.status === 500 && err.response?.data?.details?.errors?.some(e => e.code === 'USER_IS_NOT_AUTHORIZED')) {
        setError('Authentication not completed. Please try again in a few seconds.');
      } else {
        setError(`Failed to get user details: ${err.message}`);
      }
    }
  }, [onAuthenticationSuccess, ssoData]);

  // Handler for AUTHENTICATION_FAILED event
  const handleAuthenticationFailed = useCallback((event) => {
    logToServer('AUTHENTICATION_FAILED event received', event);
    setStatus('failed');
    setError('Authentication failed. Please try again.');
  }, []);

  // Register/unregister bridge event listeners
  useEffect(() => {
    if (!isFibBridgeAvailable()) {
      logToServer('Bridge not available, cannot register event listeners');
      return;
    }

    logToServer('Registering FIB bridge event listeners');
    addNativeEventListener('AUTHENTICATED', handleAuthenticated);
    addNativeEventListener('AUTHENTICATION_FAILED', handleAuthenticationFailed);

    return () => {
      logToServer('Removing FIB bridge event listeners');
      removeNativeEventListener('AUTHENTICATED', handleAuthenticated);
      removeNativeEventListener('AUTHENTICATION_FAILED', handleAuthenticationFailed);
    };
  }, [handleAuthenticated, handleAuthenticationFailed]);

  // Initiate SSO and send AUTHENTICATE to bridge
  const initiateFibSso = useCallback(async () => {
    logToServer('Initiating FIB SSO...');
    setStatus('authenticating');
    setError('');
    setSsoData(null);
    
    try {
      // Step 1: Call backend to initiate SSO (using backend proxy)
      logToServer('Calling backend to initiate SSO...');
      const response = await axios.post('/api/auth/fib-sso/initiate');
      
      if (response.data && response.data.ssoAuthorizationCode) {
        setSsoData(response.data);
        logToServer('SSO initiated successfully', {
          readableId: response.data.ssoAuthorizationCode,
          validUntil: response.data.validUntil
        });
        
        // Step 2: Send AUTHENTICATE message to native app
        if (isFibBridgeAvailable()) {
          logToServer('Sending AUTHENTICATE message to native app...');
          authenticateWithNative(response.data.ssoAuthorizationCode);
        } else {
          throw new Error('FIB Native Bridge not available');
        }
      } else {
        throw new Error('Failed to initiate FIB SSO - no readableId received');
      }
    } catch (err) {
      logToServer('Error initiating FIB SSO', {
        error: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setStatus('failed');
      if (err.message.includes('FIB Native Bridge not available')) {
        setError('FIB Native Bridge not available. Please update your FIB app or contact support.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please check FIB credentials.');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please try again later.');
      } else {
        setError(`Failed to start authentication process: ${err.message}`);
      }
    }
  }, []);

  // On mount or retry, start the SSO process
  useEffect(() => {
    logToServer('FibSplashScreen mounted', { retryCount });
    
    // Wait a bit for bridge to be ready
    const timer = setTimeout(() => {
      if (isFibBridgeAvailable()) {
        logToServer('Bridge is available, starting SSO...');
        initiateFibSso();
      } else {
        logToServer('Bridge not available after timeout');
        setStatus('failed');
        setError('FIB Native Bridge not available. Please update your FIB app or contact support.');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [retryCount, initiateFibSso]);

  const handleRetry = () => {
    logToServer('Retrying FIB SSO...');
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
          <div className="logo-container">
            <div className="logo-wrapper">
              <div className="bekasshop-text-logo">
                BekasShop
              </div>
            </div>
            <img
              src="https://fib.iq/wp-content/themes/FIB/assets/images/header-logo.svg"
              alt="FIB Logo"
              className="fib-logo-large"
              onLoad={() => console.log('FIB logo loaded successfully')}
              onError={(e) => {
                console.error('Failed to load FIB logo');
                e.target.style.display = 'none';
              }}
            />
          </div>
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