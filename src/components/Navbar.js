import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  const [userDetails, setUserDetails] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const idRef = useRef(null);

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:9090/userDetails?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUserDetails(data);
        }
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      }
    };
    fetchUserDetails();
  }, [userId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        idRef.current &&
        !idRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ✅ Secure logout
  const handleLogout = () => {
    sessionStorage.removeItem("userId");
    localStorage.removeItem("userId"); // if you store here too
    navigate("/login", { replace: true }); // replace prevents back navigation
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-title">📍 Live Location Tracker</span>
      </div>

      {userId && (
        <div className="navbar-right">
          <span className="user-icon">👤</span>
          <span
            className="user-id"
            ref={idRef}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ID: {userId}
          </span>
          <button
            className="notif-btn"
            onClick={() => navigate("/notifications")}
          >
            🔔
          </button>

          {/* Dropdown menu */}
          {menuOpen && userDetails && (
            <div className="user-menu show" ref={menuRef}>
              <p><strong>{userDetails.fullName}</strong></p>
              <p>{userDetails.eMailAddress}</p>
              <p>{userDetails.mobileNumber}</p>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
