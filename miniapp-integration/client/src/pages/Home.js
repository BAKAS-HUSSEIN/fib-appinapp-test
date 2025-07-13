import React from 'react';
import { Link } from 'react-router-dom';
import { FaShippingFast, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import Banner from '../components/Banner';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="container">
        {/* Banner Section */}
        <Banner />
        
        {/* Hero Section */}
        <div className="hero-section">
          <h1>Welcome to BekasShop</h1>
          <p>Discover amazing products at great prices with secure FIB payment integration</p>
          <Link to="/shop" className="btn btn-primary">
            Shop Now
          </Link>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <div className="feature">
            <FaShippingFast className="feature-icon" />
            <h3>Fast Shipping</h3>
            <p>Get your products delivered quickly and safely</p>
          </div>
          <div className="feature">
            <FaShieldAlt className="feature-icon" />
            <h3>Secure Payment</h3>
            <p>Safe and secure checkout with FIB payment gateway</p>
          </div>
          <div className="feature">
            <FaHeadset className="feature-icon" />
            <h3>24/7 Support</h3>
            <p>We're here to help anytime you need assistance</p>
          </div>
        </div>

        {/* About Section */}
        <div className="about-section">
          <div className="about-content">
            <h2>Why Choose BekasShop?</h2>
            <p>
              BekasShop offers a seamless shopping experience with modern technology 
              and secure payment processing. Our integration with FIB (First Iraqi Bank) 
              ensures safe and reliable transactions for our customers.
            </p>
            <div className="about-features">
              <div className="about-feature">
                <h4>Modern UI/UX</h4>
                <p>Beautiful, responsive design that works on all devices</p>
              </div>
              <div className="about-feature">
                <h4>Secure Payments</h4>
                <p>FIB payment gateway integration for safe transactions</p>
              </div>
              <div className="about-feature">
                <h4>User Accounts</h4>
                <p>Create an account to track orders and save preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 