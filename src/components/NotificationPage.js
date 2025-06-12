import React, { useEffect, useState } from 'react';
import './NotificationPage.css';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState({
    PENDING: [],
    ACCEPTED: [],
    REJECTED: []
  });

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [pendingRes, acceptedRes, rejectedRes] = await Promise.all([
          fetch(`http://localhost:9090/getPendingNotifications?userId=${userId}`),
          fetch(`http://localhost:9090/acceptRequestHistory?currentUserId=${userId}`),
          fetch(`http://localhost:9090/rejectRequestHistory?currentUserId=${userId}`)
        ]);

        const [pending, accepted, rejected] = await Promise.all([
          pendingRes.json(),
          acceptedRes.json(),
          rejectedRes.json()
        ]);

        setNotifications({
          PENDING: pending,
          ACCEPTED: accepted,
          REJECTED: rejected
        });
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

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
        // Move from PENDING to ACCEPTED or REJECTED
        setNotifications(prev => {
          const updatedPending = prev.PENDING.filter(n => n.requestId !== requestId);
          const updatedItem = prev.PENDING.find(n => n.requestId === requestId);
          if (!updatedItem) return prev;

          updatedItem.status = action.toUpperCase();
          return {
            ...prev,
            PENDING: updatedPending,
            [action.toUpperCase()]: [...prev[action.toUpperCase()], updatedItem]
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
                <button className="accept-btn" onClick={() => handleAction(n.requestId, 'accept')}>
                  Accept
                </button>
                <button className="reject-btn" onClick={() => handleAction(n.requestId, 'reject')}>
                  Reject
                </button>
              </div>
            </div>
          ))
        ) : <p>No pending requests.</p>}
      </section>

      <section>
        <h3>Accepted Requests</h3>
        {ACCEPTED.length ? (
          ACCEPTED.map(n => (
            <div key={n.requestId} className="notif-card accepted">
              <p>
                Accepted request from user {n.targetUserId}
                <span className="notif-badge accepted">Accepted</span>
              </p>
            </div>
          ))
        ) : <p>No accepted requests.</p>}
      </section>

      <section>
        <h3>Rejected Requests</h3>
        {REJECTED.length ? (
          REJECTED.map(n => (
            <div key={n.requestId} className="notif-card rejected">
              <p>
                Rejected request from user {n.targetUserId}
                <span className="notif-badge rejected">Rejected</span>
              </p>
            </div>
          ))
        ) : <p>No rejected requests.</p>}
      </section>
    </div>
  );
};

export default NotificationPage;
