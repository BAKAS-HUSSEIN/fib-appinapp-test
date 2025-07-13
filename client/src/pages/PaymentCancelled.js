import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimesCircle, FaHome, FaShoppingCart } from 'react-icons/fa';
import './PaymentPages.css';

const PaymentCancelled = () => {
  return (
    <div className="payment-page cancelled">
      <div className="container">
        <div className="payment-card">
          <div className="payment-icon">
            <FaTimesCircle />
          </div>
          <h1>Payment Cancelled</h1>
          <p>Your payment was cancelled. No charges have been made to your account.</p>
          
          <div className="payment-details">
            <div className="detail-item">
              <span>Order Status:</span>
              <span className="status cancelled">Cancelled</span>
            </div>
            <div className="detail-item">
              <span>Payment Method:</span>
              <span>FIB Payment Gateway</span>
            </div>
          </div>
          
          <div className="payment-actions">
            <Link to="/" className="btn btn-primary">
              <FaHome /> Continue Shopping
            </Link>
            <Link to="/cart" className="btn btn-secondary">
              <FaShoppingCart /> Return to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled; 