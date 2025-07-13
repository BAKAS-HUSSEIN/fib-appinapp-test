import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaQrcode, FaMobile, FaCopy, FaArrowLeft, FaRedo } from 'react-icons/fa';
import axios from 'axios';
import './FibSsoLogin.css';

const FibSsoLogin = ({ login }) => {
  const navigate = useNavigate();
  const [ssoData, setSsoData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('waiting'); // waiting, authorized, expired

  useEffect(() => {
    initiateSso();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (ssoData && timeLeft > 0 && !isExpired && status === 'waiting') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsExpired(true);
            setStatus('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [ssoData, timeLeft, isExpired, status]);

  useEffect(() => {
    let polling;
    if (ssoData && !isExpired && status === 'waiting') {
      polling = setInterval(async () => {
        try {
          const response = await axios.get(`/api/auth/fib-sso/details/${ssoData.ssoAuthorizationCode}`);
          if (response.data && response.data.name) {
            setStatus('authorized');
            clearInterval(polling);
            // Compose user object for login
            const user = {
              username: ssoData.ssoAuthorizationCode,
              isFibUser: true,
              fibName: response.data.name,
              fibIban: response.data.iban,
              fibDob: response.data.dateOfBirth,
              fibPhone: response.data.phoneNumber,
              fibGender: response.data.Gender,
            };
            setTimeout(() => {
              login(user, null);
              navigate('/');
            }, 1000);
          }
        } catch (err) {
          // Ignore errors, just keep polling until timeout
        }
      }, 2000);
    }
    return () => polling && clearInterval(polling);
  }, [ssoData, isExpired, status, login, navigate]);

  const initiateSso = async () => {
    setLoading(true);
    setError('');
    setSsoData(null);
    setTimeLeft(60);
    setIsExpired(false);
    setStatus('waiting');
    try {
      const response = await axios.post('/api/auth/fib-sso/initiate');
      if (response.data && response.data.ssoAuthorizationCode) {
        setSsoData(response.data);
      } else {
        setError('Failed to initiate FIB SSO');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to initiate FIB SSO');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="fib-sso-page">
        <div className="container">
          <div className="fib-sso-card">
            <div className="loading-spinner"></div>
            <p>Initializing FIB SSO...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fib-sso-page">
      <div className="container">
        <div className="fib-sso-card">
          <div className="fib-sso-header">
            <button 
              className="back-btn" 
              onClick={() => navigate('/login')}
            >
              <FaArrowLeft /> Back to Login
            </button>
            <br/><br/>
            <h2>Login with FIB</h2>
            <p className="fib-sso-subtitle">
              Use your FIB Personal App to authorize this login
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {ssoData && !isExpired && (
            <div className="fib-sso-content">
              <div className="countdown-timer">
                <div className="timer-circle">
                  <span className="timer-text">{formatTime(timeLeft)}</span>
                </div>
                <p className="timer-label">Time remaining to authorize</p>
              </div>

              <div className="fib-sso-methods">
                <div className="method-section">
                  <h3>QR Code</h3>
                  <div className="qr-container">
                    <img 
                      src={ssoData.qrCode} 
                      alt="FIB SSO QR Code" 
                      className="qr-code"
                    />
                  </div>
                  <p>Scan with FIB Personal App</p>
                </div>

                <div className="method-section">
                  <h3>Readable Code</h3>
                  <div className="readable-code-container">
                    <span className="readable-code">{ssoData.ssoAuthorizationCode}</span>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(ssoData.ssoAuthorizationCode)}
                    >
                      <FaCopy />
                    </button>
                  </div>
                  <p>Enter this code in FIB Personal App</p>
                </div>

                <div className="method-section">
                  <h3>Personal App Link</h3>
                  <button 
                    className="personal-app-btn"
                    onClick={() => window.open(ssoData.personalAppLink, '_blank')}
                  >
                    <FaMobile /> Open in FIB Personal App
                  </button>
                  <p>Click to open FIB Personal App directly</p>
                </div>
              </div>

              <div className="fib-sso-instructions">
                <h3>Instructions:</h3>
                <ol>
                  <li>Open your FIB Personal App</li>
                  <li>Scan the QR code or enter the readable code</li>
                  <li>You'll see an authorization popup</li>
                  <li>Click "Authorize" to complete the login</li>
                </ol>
              </div>
            </div>
          )}

          {isExpired && (
            <div className="expired-section">
              <div className="expired-icon">⏰</div>
              <h3>SSO Session Expired</h3>
              <p>The authorization session has expired. Please try again.</p>
              <button 
                className="btn btn-primary try-again-btn"
                onClick={initiateSso}
              >
                <FaRedo /> Try Again
              </button>
            </div>
          )}

          {status === 'authorized' && (
            <div className="authorized-section">
              <div className="authorized-icon">✅</div>
              <h3>Authorization Successful!</h3>
              <p>Logging you in...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FibSsoLogin; 