import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import Navbar from './Navbar';
import './MapView.css';

const MapView = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [accessibleUsers, setAccessibleUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Fetch user details only once (initial mount)
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("No userId found in localStorage");
      return;
    }

    fetch(`http://localhost:9090/userDetails?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        const user = {
          userId: data.userId,
          fullName: data.fullName,
          eMailAddress: data.eMailAddress
        };
        setCurrentUser(user);
      })
      .catch(console.error);
  }, []);

  // Init map only once
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('map').setView([20.5937, 78.9629], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 100,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
      mapRef.current = map;
    }
  }, []);

  // Fetch access list + WebSocket init
  useEffect(() => {
    if (currentUser?.userId) {
      fetch(`http://localhost:9090/userHaveAccessTo?userId=${currentUser.userId}`)
        .then(res => res.json())
        .then(setAccessibleUsers)
        .catch(console.error);

      fetch('http://localhost:9090/allUsers')
        .then(res => res.json())
        .then(setAllUsers)
        .catch(console.error);

      const socket = new SockJS("http://localhost:9090/ws");
      const client = new Client({
        webSocketFactory: () => socket,
        onConnect: () => console.log("WebSocket Connected"),
        onStompError: (err) => console.error("STOMP Error", err),
      });
      client.activate();
      stompClientRef.current = client;

      return () => {
        stompClientRef.current?.deactivate();
      };
    }
  }, [currentUser]);

  const handleUserClick = (userId) => {
    setSelectedUser(userId);
    setLocationInfo(null);

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    const topic = `/topic/coordinates/${currentUser.userId}`;
    subscriptionRef.current = stompClientRef.current.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        if (data.userId === userId) {
          setLocationInfo(data);
          updateMap(data.latitude, data.longitude);
        }
      } catch (err) {
        console.error("Error parsing location data", err);
      }
    });
  };

  const updateMap = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (!markerRef.current) {
      markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng([latitude, longitude]);
    }
    mapRef.current.setView([latitude, longitude], 13);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (value.trim() === '') {
      setMatchedUsers([]);
      return;
    }
    const matches = allUsers.filter(
      (user) =>
        user.fullName.toLowerCase().includes(value) ||
        user.userId.toString().includes(value)
    );
    setMatchedUsers(matches);
  };

  const sendRequest = (targetUserId) => {
    const payload = {
      currentUserId: currentUser.userId,
      targetUserId: targetUserId
    };

    fetch("http://localhost:9090/newNotification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (res.ok) {
          alert("Location request sent successfully!");
          setShowPopup(false);
          setSearchTerm('');
          setMatchedUsers([]);
        } else {
          throw new Error("Request failed.");
        }
      })
      .catch(err => {
        console.error("Request error:", err);
        alert("Failed to send request.");
      });
  };

  return (
    <>
      <Navbar user={currentUser} onLogout={handleLogout} />
      <div className="mapview-container">
        <aside className="sidebar">
          <h2>Accessible Users</h2>
          <ul className="user-list">
            {accessibleUsers.map(id => (
              <li
                key={id}
                className={selectedUser === id ? 'active' : ''}
                onClick={() => handleUserClick(id)}
              >
                User {id}
              </li>
            ))}
          </ul>
          <button className="request-btn" onClick={() => setShowPopup(true)}>
            Request User Location
          </button>
        </aside>

        <main className="main-content">
          <div className="location-info">
            {locationInfo
              ? `User ${locationInfo.userId} → Latitude: ${locationInfo.latitude}, Longitude: ${locationInfo.longitude}`
              : "Select a user to track location."}
          </div>
          <div id="map" className="map-area"></div>
        </main>
      </div>

      {showPopup && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
            <h3>Request User Location</h3>
            <input
              type="text"
              placeholder="Enter user name or ID"
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <ul className="matched-users">
              {matchedUsers.map(user => (
                <li key={user.userId} className="matched-user-card">
                  <div className="user-info">
                    <div className="user-name">{user.fullName}</div>
                    <div className="user-meta">
                      ID: {user.userId}<br />
                      {user.eMailAddress && <>Email: {user.eMailAddress}<br /></>}
                      {user.mobileNumber && <>Phone: {user.mobileNumber}</>}
                    </div>
                  </div>
                  <button
                    className="send-request-btn"
                    onClick={() => sendRequest(user.userId)}
                  >
                    Request
                  </button>
                </li>
              ))}
              {matchedUsers.length === 0 && searchTerm && (
                <li className="no-match">No users found.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default MapView;
