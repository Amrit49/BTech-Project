import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import './AdminNotification.css'; // Optional: Custom styling
import AdminNavbar from './AdminNavbar';

const AdminNotification = () => {
  // State to store notifications
  const [notifications, setNotifications] = useState([]);
  const [error,setError] = useState(null);
  // Dummy notifications for now (replace with API fetch)
  useEffect(() => {
    const fetchNotifications = async () => {
        try{

             const token = localStorage.getItem("authToken"); // or wherever your token is stored
            if (!token) {
                setError("Authorization token is missing.");
                return;
            }

            const response = await fetch("http://localhost:5000/api/admin-notifications", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if(response.ok){
                const data = await response.json();
                setNotifications(data.notifications);
            }
            else{
                const errorData = await response.json();
                setError(errorData.message);
            }
        }
        catch (error) {
            setError("An error occurred while fetching notifications.");
        }
    };
      
    fetchNotifications();
    
    
  }, []);

  return (
    <div className='admin-notification-page'>
      <AdminNavbar /> {/* Assuming NavBar component exists */}
      
      <div className="dashboard-heading">
                <h1>NOTIFICATIONS</h1>
            </div>
      <div className="admin-notification-list-container">
      {error && <p className="error-message">{error}</p>}

        
        {notifications.length === 0 && !error ? (
          <p>No new notifications</p>
        ) : (
          <ul className="admin-notification-list">
            {notifications.map((notification) => (
              <li key={notification.id} className="admin-notification-item">
                <div className="admin-notification-message">{notification.message}</div>
                <div className="admin-notification-date">{notification.date}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminNotification;
