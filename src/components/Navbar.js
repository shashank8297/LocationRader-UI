// src/components/Navbar.js
import React from 'react';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        📍 <span className="app-title">Live Location Tracker</span>
      </div>
      <div className="navbar-right">
        {user && (
          <div className="user-info">
            <span className="user-icon">👤</span>
            <span className="user-id">ID: {user.userId}</span>
            <span className="user-name">({user.fullName})</span>
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
