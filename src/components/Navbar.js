import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-title">📍 Live Location Tracker</span>
      </div>

      {user && (
        <div className="navbar-right">
          <span className="user-icon">👤</span>
          <span className="user-id">ID: {user.userId}</span>
          <span className="user-name">({user.fullName})</span>
          <button className="notif-btn" onClick={() => navigate('/notifications')}>🔔</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
