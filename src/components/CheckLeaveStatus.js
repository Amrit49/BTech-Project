import React, { useState, useEffect } from "react";
import './CheckLeaveStatus.css'; // Add custom styles for this page
import NavBar from './NavBar';

const CheckLeaveStatus = () => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch leave status when the component mounts
  const fetchLeaveStatus = async () => {
    try {
      const token = localStorage.getItem('token'); 

      const response = await fetch("http://localhost:5000/api/leave-status", {
        headers: {
          'Authorization': `Bearer ${token}`, // Corrected interpolation
        },
      });
      
  
      if (!response.ok) {
        throw new Error("Failed to fetch leave status");
      }
      const data = await response.json();
      setLeaveApplications(data);
      console.log(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  

useEffect(() => {
  fetchLeaveStatus();
},[]);



  return (
    <div className="check-leave-status">
      <NavBar />
      <h2>Leave Application Status</h2>
      {leaveApplications.length === 0 ? (
        <p>No recent leave applications found.</p>
      ) : (
        <table className="status-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Current Approver</th>
            </tr>
          </thead>
          <tbody>
            {leaveApplications.map((leave, index) => (
              <tr key={index}>
                <td>{leave.leave_name}</td>
                <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                <td>{leave.reason}</td>
                <td>{leave.status}</td>
                <td>{leave.current_approver ? ` ${leave.current_approver}` : 'No approver yet'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CheckLeaveStatus;
