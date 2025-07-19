import React from 'react';
import './Profile.css';

const Profile = ({ user }) => {
  if (!user) {
    return <div>No user data available</div>;
  }

  // Check if this is a FIB user
  if (user.isFibUser) {
    return (
      <div className="profile-container">
        <h2>FIB User Profile</h2>
        <div className="profile-details">
          <div className="profile-item">
            <strong>Name:</strong> {user.fibName}
          </div>
          <div className="profile-item">
            <strong>IBAN:</strong> {user.fibIban}
          </div>
          <div className="profile-item">
            <strong>Date of Birth:</strong> {user.fibDob}
          </div>
          <div className="profile-item">
            <strong>Phone Number:</strong> {user.fibPhone}
          </div>
          <div className="profile-item">
            <strong>Gender:</strong> {user.fibGender}
          </div>
          <div className="profile-item">
            <strong>User ID:</strong> {user.username}
          </div>
        </div>
      </div>
    );
  }

  // Regular user profile
  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="profile-details">
        <div className="profile-item">
          <strong>Username:</strong> {user.username}
        </div>
        <div className="profile-item">
          <strong>Email:</strong> {user.email}
        </div>
      </div>
    </div>
  );
};

export default Profile; 