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

  // Add request/response interceptors for debugging
  fibApi.interceptors.request.use(
    (config) => {
      console.log('FIB API Request:', config.method?.toUpperCase(), config.url, config.auth);
      return config;
    },
    (error) => {
      console.error('FIB API Request Error:', error);
      return Promise.reject(error);
    }
  );

  fibApi.interceptors.response.use(
    (response) => {
      console.log('FIB API Response:', response.status, response.data);
      return response;
    },
    (error) => {
      console.error('FIB API Response Error:', error.response?.status, error.response?.data);
      return Promise.reject(error);
    }
  );

  // Handler for AUTHENTICATED event
  const handleAuthenticated = useCallback(async (event) => {
    console.log('AUTHENTICATED event received:', event);
    setStatus('success');
    try {
      const readableId = ssoData?.ssoAuthorizationCode;
      if (!readableId) throw new Error('No readableId');
      
      // Get user details from FIB API using the readableId (without hyphens)
      const normalizedReadableId = readableId.replaceAll('-', '');
      console.log('Getting user details for readableId:', normalizedReadableId);
      
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
        console.log('User authenticated successfully:', user);
        setTimeout(() => {
          onAuthenticationSuccess(user, null);
        }, 1000);
      } else {
        throw new Error('Failed to get user details - no name in response');
      }
    } catch (err) {
      console.error('Error getting user details:', err);
      setStatus('failed');
      if (err.response?.status === 401) {
        setError('Authentication failed. Please check FIB credentials.');
      } else if (err.response?.status === 404) {
        setError('User details not found. Please try again.');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please try again later.');
      } else {
        setError(`Failed to get user details: ${err.message}`);
      }
    }
  }, [onAuthenticationSuccess, ssoData, fibApi]);

  // Handler for AUTHENTICATION_FAILED event
  const handleAuthenticationFailed = useCallback((event) => {
    console.log('AUTHENTICATION_FAILED event received:', event);
    setStatus('failed');
    setError('Authentication failed. Please try again.');
  }, []);

  // Register/unregister bridge event listeners
  useEffect(() => {
    if (!isFibBridgeAvailable()) {
      console.log('Bridge not available, cannot register event listeners');
      return;
    }

    console.log('Registering FIB bridge event listeners');
    addNativeEventListener('AUTHENTICATED', handleAuthenticated);
    addNativeEventListener('AUTHENTICATION_FAILED', handleAuthenticationFailed);

    return () => {
      console.log('Removing FIB bridge event listeners');
      removeNativeEventListener('AUTHENTICATED', handleAuthenticated);
      removeNativeEventListener('AUTHENTICATION_FAILED', handleAuthenticationFailed);
    };
  }, [handleAuthenticated, handleAuthenticationFailed]);

  // Initiate SSO and send AUTHENTICATE to bridge
  const initiateFibSso = useCallback(async () => {
    console.log('Initiating FIB SSO...');
    setStatus('authenticating');
    setError('');
    setSsoData(null);
    
    try {
      // Step 1: Call FIB API to initiate SSO
      console.log('Calling FIB API to initiate SSO...');
      const response = await fibApi.post('/sso');
      
      if (response.data && response.data.ssoAuthorizationCode) {
        setSsoData(response.data);
        console.log('SSO initiated, readableId:', response.data.ssoAuthorizationCode);
        
        // Step 2: Send AUTHENTICATE message to native app
        if (isFibBridgeAvailable()) {
          console.log('Sending AUTHENTICATE message to native app...');
          authenticateWithNative(response.data.ssoAuthorizationCode);
        } else {
          throw new Error('FIB Native Bridge not available');
        }
      } else {
        throw new Error('Failed to initiate FIB SSO - no readableId received');
      }
    } catch (err) {
      console.error('Error initiating FIB SSO:', err);
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
  }, [fibApi]);

  // On mount or retry, start the SSO process
  useEffect(() => {
    console.log('FibSplashScreen mounted, retryCount:', retryCount);
    
    // Wait a bit for bridge to be ready
    const timer = setTimeout(() => {
      if (isFibBridgeAvailable()) {
        console.log('Bridge is available, starting SSO...');
        initiateFibSso();
      } else {
        console.log('Bridge not available after timeout');
        setStatus('failed');
        setError('FIB Native Bridge not available. Please update your FIB app or contact support.');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [retryCount, initiateFibSso]);

  const handleRetry = () => {
    console.log('Retrying FIB SSO...');
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