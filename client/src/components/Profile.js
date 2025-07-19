import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaUser, FaShoppingBag, FaSignOutAlt, FaPhone, FaIdCard, FaCalendar, FaVenusMars } from 'react-icons/fa';
import { sendMessageToNative } from '../utils/fibBridge';
import { useFibContext } from '../context/FibContext';
import './Profile.css';

const Profile = ({ user, onClose }) => {
  const navigate = useNavigate();
  const { isFibMode } = useFibContext();
  const [showUserDetails, setShowUserDetails] = useState(false);

  const handleExit = () => {
    if (isFibMode) {
      try {
        sendMessageToNative('EXIT');
        console.log('Exit message sent to native app');
      } catch (error) {
        console.error('Failed to send exit message:', error);
        // Fallback: just close the profile
        onClose();
      }
    } else {
      // For non-FIB mode, just close the profile
      onClose();
    }
  };

  const handleOrdersClick = () => {
    onClose();
    navigate('/orders');
  };

  const handleUserDetailsClick = () => {
    setShowUserDetails(true);
  };

  const handleBackToMenu = () => {
    setShowUserDetails(false);
  };

  if (!user) {
    return <div>No user data available</div>;
  }

  // Show user details view
  if (showUserDetails) {
    return (
      <div className="profile-overlay" onClick={onClose}>
        <div className="profile-modal menu-style" onClick={(e) => e.stopPropagation()}>
          <div className="menu-header">
            <button className="back-btn" onClick={handleBackToMenu}>
              <FaTimes />
            </button>
            <h3>User Details</h3>
            <div></div> {/* Empty div for flex spacing */}
          </div>
          
          <div className="menu-content">
            {user.isFibUser ? (
              <div className="user-details-list">
                <div className="detail-item">
                  <FaUser className="detail-icon" />
                  <div className="detail-content">
                    <label>Name</label>
                    <span>{user.fibName || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <FaIdCard className="detail-icon" />
                  <div className="detail-content">
                    <label>User ID</label>
                    <span>{user.username || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <FaIdCard className="detail-icon" />
                  <div className="detail-content">
                    <label>IBAN</label>
                    <span>{user.fibIban || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <FaCalendar className="detail-icon" />
                  <div className="detail-content">
                    <label>Date of Birth</label>
                    <span>{user.fibDob || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <FaPhone className="detail-icon" />
                  <div className="detail-content">
                    <label>Phone Number</label>
                    <span>{user.fibPhone || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <FaVenusMars className="detail-icon" />
                  <div className="detail-content">
                    <label>Gender</label>
                    <span>{user.fibGender || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="user-details-list">
                <div className="detail-item">
                  <FaUser className="detail-icon" />
                  <div className="detail-content">
                    <label>Username</label>
                    <span>{user.username}</span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <FaIdCard className="detail-icon" />
                  <div className="detail-content">
                    <label>Email</label>
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show main menu view
  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal menu-style" onClick={(e) => e.stopPropagation()}>
        <div className="menu-header">
          <div></div> {/* Empty div for flex spacing */}
          <h3>{user.isFibUser ? user.fibName : 'User Menu'}</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="menu-content">
          {user.isFibUser && (
            <div className="user-info">
              <div className="user-phone">{user.fibPhone}</div>
            </div>
          )}
          
          <div className="menu-items">
            <button className="menu-item" onClick={handleUserDetailsClick}>
              <FaUser className="menu-icon" />
              <span>User Details</span>
            </button>
            
            <button className="menu-item" onClick={handleOrdersClick}>
              <FaShoppingBag className="menu-icon" />
              <span>Orders</span>
            </button>
            
            {isFibMode && (
              <button className="menu-item exit-item" onClick={handleExit}>
                <FaSignOutAlt className="menu-icon" />
                <span>Exit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 