import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PaymentPages.css';

const POLL_INTERVAL = 3000; // 3 seconds

const FIBPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentInfo = location.state;
  const [status, setStatus] = useState('PENDING');
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [showCancelMsg, setShowCancelMsg] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);

  useEffect(() => {
    if (!paymentInfo || !paymentInfo.paymentId) {
      setError('Missing payment information.');
      return;
    }
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentInfo]);

  useEffect(() => {
    if (!paymentInfo || !paymentInfo.paymentId) return;
    if (status !== 'PENDING') return;
    // Poll payment status
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/fib/status/${paymentInfo.paymentId}`);
        const data = await res.json();
        if (data.success && data.status === 'PAID') {
          setStatus('PAID');
          clearInterval(poll);
          setTimeout(() => navigate('/payment-success'), 1000);
        } else if (data.status === 'DECLINED') {
          setStatus('DECLINED');
          clearInterval(poll);
        }
      } catch (err) {
        setError('Failed to check payment status.');
        clearInterval(poll);
      }
    }, POLL_INTERVAL);
    return () => clearInterval(poll);
  }, [paymentInfo, status, navigate]);

  useEffect(() => {
    if (status === 'PAID' && paymentInfo && !orderSaved) {
      // Save order to backend
      const saveOrder = async () => {
        try {
          const token = localStorage.getItem('token');
          await fetch('/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              items: paymentInfo.items,
              total_amount: paymentInfo.total_amount,
              payment_id: paymentInfo.paymentId
            })
          });
          setOrderSaved(true);
          setTimeout(() => navigate('/payment-success'), 1000);
        } catch (err) {
          setError('Failed to save order after payment.');
        }
      };
      saveOrder();
    }
  }, [status, paymentInfo, orderSaved, navigate]);

  // Cancel payment logic
  const handleCancel = async () => {
    if (!paymentInfo || !paymentInfo.paymentId) return;
    setIsCancelling(true);
    try {
      await fetch(`/api/payment/fib/cancel/${paymentInfo.paymentId}`, { method: 'POST' });
      setShowCancelMsg(true);
      setTimeout(() => {
        navigate('/shop', { state: { cancelled: true } });
      }, 3000);
    } catch (err) {
      setError('Failed to cancel payment.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Try again logic
  const handleTryAgain = async () => {
    if (!paymentInfo) return;
    setIsRetrying(true);
    try {
      // Re-initiate payment with same amount/order
      const res = await fetch('/api/payment/fib', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentInfo.amount,
          order_id: paymentInfo.order_id,
          customer_details: paymentInfo.customer_details,
          description: paymentInfo.description
        })
      });
      const data = await res.json();
      if (data.success) {
        navigate('/fib-payment', { state: { ...data, amount: paymentInfo.amount, order_id: paymentInfo.order_id, customer_details: paymentInfo.customer_details, description: paymentInfo.description } });
      } else {
        setError('Failed to generate new payment.');
      }
    } catch (err) {
      setError('Failed to generate new payment.');
    } finally {
      setIsRetrying(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // UI for cancel message
  useEffect(() => {
    if (showCancelMsg) {
      const t = setTimeout(() => setShowCancelMsg(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showCancelMsg]);

  if (error) {
    return <div className="payment-page error"><div className="payment-card"><h2>Error</h2><p>{error}</p></div></div>;
  }
  if (!paymentInfo) {
    return null;
  }
  return (
    <div className="payment-page">
      <div className="payment-card">
        <h2 style={{ marginBottom: '2rem' }}>Scan to Pay with FIB</h2>
        <div className="payment-qr-section" style={{ marginBottom: '2rem' }}>
          {paymentInfo.qrCode && (
            <img src={paymentInfo.qrCode} alt="FIB QR Code" className="fib-qr" />
          )}
          <div className="payment-details" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}><strong>Readable Code:</strong> {paymentInfo.readableCode}</div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Expires In:</strong> <span className="timer warning-timer">{formatTime(timeLeft)}</span>
            </div>
            <div className="app-links" style={{ marginBottom: '1rem' }}>
              {paymentInfo.personalAppLink && (
                <a href={paymentInfo.personalAppLink} target="_blank" rel="noopener noreferrer" className="fib-app-btn">Open in FIB Personal App</a>
              )}
            </div>
          </div>
        </div>
        {status === 'DECLINED' && <div className="alert alert-error">Payment was declined.</div>}
        {status === 'EXPIRED' && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            Payment expired. Please try again.
            <div className="payment-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={handleTryAgain} disabled={isRetrying}>{isRetrying ? 'Processing...' : 'Try Again'}</button>
              <button className="btn btn-secondary" onClick={() => navigate('/shop')}>Back</button>
            </div>
          </div>
        )}
        {status === 'PAID' && <div className="alert alert-success">Payment successful! Redirecting...</div>}
        <div className="payment-actions" style={{ marginTop: '2rem' }}>
          {status !== 'EXPIRED' && (
            <button className="btn btn-danger" onClick={handleCancel} disabled={isCancelling}>{isCancelling ? 'Cancelling...' : 'Cancel'}</button>
          )}
        </div>
        <div className="payment-instructions" style={{ marginTop: '2rem' }}>
          <p>Scan the QR code above with your FIB app or use the readable code to complete your payment. The payment will expire in 5 minutes.</p>
        </div>
        {showCancelMsg && (
          <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
            Payment or order has been canceled.
          </div>
        )}
      </div>
    </div>
  );
};

export default FIBPaymentPage; 