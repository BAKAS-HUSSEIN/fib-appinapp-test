import React, { useState } from 'react';
import { FaUser, FaPhone, FaCreditCard, FaCalendar, FaVenusMars, FaTimes } from 'react-icons/fa';
import './Profile.css';

const Profile = ({ user, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!user) return null;

  return (
    <div className={`profile-overlay ${isVisible ? 'visible' : ''}`} onClick={handleClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <h3>User Profile</h3>
        </div>
        <div className="profile-content">
          {/* Centered close button above avatar */}
          <div className="below-avatar-close-row">
            <button className="giant-close-btn" onClick={handleClose} aria-label="Close profile">
              <FaTimes />
            </button>
          </div>
          <div className="profile-avatar">
            <FaUser />
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
            {user.isFibUser && (
              <>
                <div className="fib-section">
                  <h4>FIB Account Details</h4>
                  {user.fibName && (
                    <div className="info-group">
                      <label>Full Name:</label>
                      <span>{user.fibName}</span>
                    </div>
                  )}
                  {user.fibPhone && (
                    <div className="info-group">
                      <label>Phone Number:</label>
                      <span className="phone-number">
                        <FaPhone /> {user.fibPhone}
                      </span>
                    </div>
                  )}
                  {user.fibIban && (
                    <div className="info-group">
                      <label>IBAN:</label>
                      <span className="iban">
                        <FaCreditCard /> {user.fibIban}
                      </span>
                    </div>
                  )}
                  {user.fibGender && (
                    <div className="info-group">
                      <label>Gender:</label>
                      <span className="gender">
                        <FaVenusMars /> {user.fibGender}
                      </span>
                    </div>
                  )}
                  {user.fibDob && (
                    <div className="info-group">
                      <label>Date of Birth:</label>
                      <span className="dob">
                        <FaCalendar /> {user.fibDob}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
            {!user.isFibUser && (
              <div className="regular-user-note">
                <p>Regular account user</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 