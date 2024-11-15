import React, { useState, useEffect } from 'react';
import './PendingTasksAdmin.css'; // Create a separate CSS file for styling
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

const PendingTasksAdmin = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const navigate = useNavigate();

  // Dummy data for pending tasks (you can replace this with actual API call)
  useEffect(() => {
    // Simulate fetching data from API or backend
    const fetchedPendingLeaves = async () => {
      try{
        const response = await fetch("http://localhost:5000/api/pending-leaves");
        if(!response.ok){
          throw new Error("Failed to fetch pending leaves");
        }
        const data = await response.json();
        setPendingLeaves(data);
      }
      catch(error){
        console.error("Error fetching pending leaves:", error);
      }
    }
    fetchedPendingLeaves();
  }, []);

  const handleViewLeaveClick = (leaveId) => {
    // Navigate to a detailed leave view page for that leave
    if (leaveId) {
      navigate(`/leave/${leaveId}`);
    } else {
      console.error("Invalid leave ID");
    }
  };

  return (
    <div className='pending-admin-page'>
<AdminNavbar />
   
    <div className="pending-tasks-admin-container">
    <div className="dashboard-heading">
                <h1>PENDING TASKS</h1>
            </div>
      <div className="pending-tasks-admin-section">
        <table className="pending-tasks-admin-table">
          <thead>
            <tr>
              <th>Faculty Name</th>
              <th>Leave Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingLeaves.length > 0 ? (
              pendingLeaves.map((leave) => (
                <tr key={leave.leave_id}>
                  <td>{leave.facultyName}</td>
                  <td>{leave.leaveType}</td>
                  <td>
                    <button
                      className="view-leave-btn"
                      onClick={() => handleViewLeaveClick(leave.leave_id)}
                    >
                      View Leave
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No pending tasks</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
     </div>
  );
};

export default PendingTasksAdmin;
