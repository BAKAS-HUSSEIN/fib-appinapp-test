import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaShoppingCart } from 'react-icons/fa';
import './PaymentPages.css';

const PaymentSuccess = () => {
  return (
    <div className="payment-page success">
      <div className="container">
        <div className="payment-card">
          <div className="payment-icon">
            <FaCheckCircle />
          </div>
          <h1>Payment Successful!</h1>
          <p>Thank you for your purchase. Your order has been confirmed and will be processed soon.</p>
          
          <div className="payment-details">
            <div className="detail-item">
              <span>Order Status:</span>
              <span className="status success">Confirmed</span>
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
            <Link to="/orders" className="btn btn-secondary">
              <FaShoppingCart /> View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 