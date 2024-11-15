import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import './HomePage.css';

const HomePage = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [userId, setUserId] = useState(null);
  // Fetch current user ID from the backend

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch("http://localhost:5000/get-current-user", {
          method: "GET",
          headers:{
            'Content-Type' : 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if(response.status === 401){
          localStorage.clear()
          navigate('/login');
        }
        else{
          const data = await response.json();

          if (data && data.user_id) {
            setUserId(data.user_id);  // Set user ID from backend response
            console.log("User ID fetched:", data.user_id);  // Log userId for debugging
        } else {
            console.error("User not logged in or session expired");
        }
      }
    }
       catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  useEffect(() => {
    const fetchLeaveBalances = async () => {
      if (userId) {
        try {
          // console.log("Fetching leave balances for user ID:", userId);  // Log userId before fetching
  
          const token = localStorage.getItem('token'); // Retrieve token from localStorage
          if (!token) {
            console.error("Token is missing.");
            return;
          }
          const response = await fetch(`http://localhost:5000/api/leave-balance/${userId}`, {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, // Include token in the headers
            },
          });
  
          if (response.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            console.error("Unauthorized access. Redirecting to login.");
            localStorage.clear();
            navigate('/login');
          } else {
            const data = await response.json();
            // console.log("Leave Balances Data:", data);  // Debugging line
            if (!Array.isArray(data) || data.length === 0) {
              console.error("No leave balance data found for user.");
              return;
            }
            setLeaveData(data);
          }
        } catch (error) {
          console.error("Failed to fetch leave balances:", error);
        }
      }
    };
  
    if (userId) {
      fetchLeaveBalances();  // Call only if userId is available
    }
  }, [userId, navigate]); // Include navigate to ensure proper hook dependencies
  

  const handleApplyLeave = (leaveType) => {
    setSelectedLeaveType(leaveType);
    setShowForm(true);  // Show the form
  };

  return (
    <div className="home-page">
      <div className="content">
        {/* Conditional rendering for form or leave balances */}
        {!showForm ? (
          <div className="right-section">
            <h2>CURRENT YEAR BALANCES</h2>
            <div className="leave-cards">
  {Array.isArray(leaveData) && leaveData.length > 0 ? (
    leaveData.map((leave, index) => (
      <div className="leave-card" key={index}>
        <h3>{leave.type}</h3>
        <p>CREDIT: {leave.credit}</p>
        <p>USED: {leave.used_amount}</p>
        <p>REMAINING: {leave.remaining}</p>
        <button className="apply-btn" onClick={() => handleApplyLeave(leave.type)}>
          Apply Leave
        </button>
      </div>
    ))
  ) : (
    <p>No leave balance data available.</p>  // If no leave balances, show a message
  )}
</div>
          </div>
        ) : (
          <LeaveForm leaveType={selectedLeaveType} setShowForm={setShowForm} />
        )}
      </div>
    </div>
  );
};

// Leave form component
const LeaveForm = ({ leaveType, setShowForm }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    startDate: '',
    endDate: '',
    reason: '',
    attachment: null,
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create a form data object
    const formDataToSend = new FormData();
    formDataToSend.append('leave_name',leaveType);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('start_date', formData.startDate);
    formDataToSend.append('end_date', formData.endDate);
    formDataToSend.append('reason', formData.reason);
    if (formData.attachment) {
        formDataToSend.append('attachment', formData.attachment);
    }
    
    formDataToSend.append('approver_role','Admin');
    try {
      const token = localStorage.getItem('token');

        const response = await fetch("http://localhost:5000/api/apply-leave", {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`,
          },
            body: formDataToSend
        });

        const result = await response.json();
        if (response.ok) {
            alert("Leave application submitted successfully!");
            setShowForm(false);
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Error submitting leave application:", error);
        alert("Failed to submit leave application.");
    }
};


  return (
    <div className="leave-form">
      <h2>APPLY FOR {leaveType}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
        </label>
        <label>
          Email:
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
        </label>
        <label>
          Start Date:
          <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
        </label>
        <label>
          End Date:
          <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
        </label>
        <label>
          Reason:
          <textarea name="reason" value={formData.reason} onChange={handleInputChange} required></textarea>
        </label>
        <label>
          Attach Document:
          <input type="file" name="attachment" onChange={handleInputChange} />
        </label>
        <button type="submit">Submit</button>
        <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
      </form>
    </div>
  );
};

export default HomePage;


