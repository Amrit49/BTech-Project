import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import './Notification.css'; // Optional: Custom styling

const Notifications = () => {
  // State to store notifications
  const [notifications, setNotifications] = useState([]);
  const [error,setError] = useState(null);
  // Dummy notifications for now (replace with API fetch)
  const dummyNotifications = [
    {
      id: 1,
      message: "Your leave application for 21th November 2024 has been approved.",
      created_at: "2024-11-15T14:30:00Z",
    },
  ];
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // const response = await fetch('http://localhost:5000/api/user-notifications', {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem("token")}`, // Use token if required
        //   },
        // });

        // if (!response.ok) {
        //   throw new Error('Failed to fetch notifications');
        // }

        // const data = await response.json();
        setNotifications(dummyNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);


  return (
    <div className='notification-page'>
      <NavBar /> {/* Assuming NavBar component exists */}
      
      <div className="notification-list-container">
        <h2>NOTIFICATIONS</h2>
        
        {notifications.length === 0 ? (
          <p>No new notifications</p>
        ) : (
          <ul className="notification-list">
            {notifications.map((notification) => (
              <li key={notification.id} className="notification-item">
                <div className="notification-message">{notification.message}</div>
                <div className="notification-date">{new Date(notification.created_at).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
