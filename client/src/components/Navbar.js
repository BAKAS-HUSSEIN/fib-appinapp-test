import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaBars } from 'react-icons/fa';
import Profile from './Profile';
import { useFibContext } from '../context/FibContext';
import './Navbar.css';

const Navbar = ({ user, logout, cartCount }) => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const { isFibMode } = useFibContext();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  const handleProfileClose = () => {
    setShowProfile(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">
            <h2>BekasShop</h2>
            <img src="https://fib.iq/wp-content/themes/FIB/assets/images/header-logo.svg" alt="FIB Logo" className="fib-logo" />
          </Link>
        </div>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/shop" className="nav-link">Shop</Link>
          </li>
          <li className="nav-item">
            <Link to="/cart" className="nav-link cart-icon">
              <FaShoppingCart />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
          </li>
          {user ? (
            <>
              {/* Show profile menu for all users (including FIB users) */}
              <li className="nav-item">
                <button onClick={handleProfileClick} className="nav-link profile-btn">
                  <FaBars /> Menu
                </button>
              </li>
              {/* Only show logout if NOT in FIB mode */}
              {!isFibMode && (
                <li className="nav-item">
                  <button onClick={handleLogout} className="nav-link logout-btn">
                    <FaSignOutAlt /> Logout
                  </button>
                </li>
              )}
            </>
          ) : (
            <>
              {/* Only show login/register if NOT in FIB mode */}
              {!isFibMode && (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="nav-link">Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/register" className="nav-link">Register</Link>
                  </li>
                </>
              )}
            </>
          )}
        </ul>
      </div>
      
      {/* Use Profile component's built-in overlay */}
      {showProfile && <Profile user={user} onClose={handleProfileClose} />}
    </nav>
  );
};

export default Navbar; 