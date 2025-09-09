import React, { useEffect, useState } from 'react';
import './NotificationPage.css';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState({
    PENDING: [],
    ACCEPTED: [],
    REJECTED: []
  });

  const userId = sessionStorage.getItem('userId');

  const statusMap = {
    accept: 'ACCEPTED',
    reject: 'REJECTED'
  };

  // Fetch all notifications at once
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:9090/getAllNotifications?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');

      const data = await res.json(); // should return { PENDING: [], ACCEPTED: [], REJECTED: [] }
      setNotifications({
        PENDING: data.PENDING || [],
        ACCEPTED: data.ACCEPTED || [],
        REJECTED: data.REJECTED || []
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const handleAction = async (requestId, action) => {
    try {
      const res = await fetch(`http://localhost:9090/${action}Request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      });

      if (res.ok) {
        setNotifications(prev => {
          const updatedPending = prev.PENDING.filter(n => n.requestId !== requestId);
          const updatedItem = prev.PENDING.find(n => n.requestId === requestId);
          if (!updatedItem) return prev;

          const clonedItem = { ...updatedItem, status: statusMap[action] };

          return {
            ...prev,
            PENDING: updatedPending,
            [statusMap[action]]: [...prev[statusMap[action]], clonedItem]
          };
        });
      }
    } catch (err) {
      console.error('Failed to process request:', err);
    }
  };

  const { PENDING, ACCEPTED, REJECTED } = notifications;

  return (
    <div className="notification-page">
      <h2>Notifications</h2>

      <section>
        <h3>Pending Requests</h3>
        {PENDING.length ? (
          PENDING.map(n => (
            <div key={n.requestId} className="notif-card">
              <p>
                User {n.currentUserId} requested your location.
                <span className="notif-badge pending">Pending</span>
              </p>
              <div>
                <button
                  className="accept-btn"
                  onClick={() => handleAction(n.requestId, 'accept')}
                >
                  Accept
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleAction(n.requestId, 'reject')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No pending requests.</p>
        )}
      </section>

      <section>
        <h3>Accepted Requests</h3>
        {ACCEPTED.length ? (
          ACCEPTED.map(n => (
            <div key={n.requestId} className="notif-card accepted">
              <p>
                Accepted request from user {n.currentUserId}
                <span className="notif-badge accepted">Accepted</span>
              </p>
            </div>
          ))
        ) : (
          <p>No accepted requests.</p>
        )}
      </section>

      <section>
        <h3>Rejected Requests</h3>
        {REJECTED.length ? (
          REJECTED.map(n => (
            <div key={n.requestId} className="notif-card rejected">
              <p>
                Rejected request from user {n.currentUserId}
                <span className="notif-badge rejected">Rejected</span>
              </p>
            </div>
          ))
        ) : (
          <p>No rejected requests.</p>
        )}
      </section>
    </div>
  );
};

export default NotificationPage;
