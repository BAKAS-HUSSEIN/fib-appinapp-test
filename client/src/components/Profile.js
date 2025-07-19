import React from 'react';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import './Profile.css';

const Profile = ({ user, onClose }) => {
  if (!user) {
    return <div>No user data available</div>;
  }

  // Check if this is a FIB user
  if (user.isFibUser) {
    return (
      <div className="profile-overlay" onClick={onClose}>
        <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
          <div className="profile-header">
            <button className="back-btn" onClick={onClose}>
              <FaArrowLeft />
            </button>
            <h3>FIB Profile</h3>
            <button className="close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
          
          <div className="profile-content">
            <div className="profile-avatar">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            
            <div className="profile-info">
              <div className="info-group">
                <label>Name:</label>
                <span>{user.fibName || 'N/A'}</span>
              </div>
              
              <div className="info-group">
                <label>User ID:</label>
                <span>{user.username || 'N/A'}</span>
              </div>
              
              <div className="info-group">
                <label>IBAN:</label>
                <span>{user.fibIban || 'N/A'}</span>
              </div>
              
              <div className="info-group">
                <label>Date of Birth:</label>
                <span>{user.fibDob || 'N/A'}</span>
              </div>
              
              <div className="info-group">
                <label>Phone Number:</label>
                <span>{user.fibPhone || 'N/A'}</span>
              </div>
              
              <div className="info-group">
                <label>Gender:</label>
                <span>{user.fibGender || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular user profile
  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <button className="back-btn" onClick={onClose}>
            <FaArrowLeft />
          </button>
          <h3>User Profile</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="profile-content">
          <div className="profile-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          
          <div className="profile-info">
            <div className="info-group">
              <label>Username:</label>
              <span>{user.username}</span>
            </div>
            
            <div className="info-group">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 