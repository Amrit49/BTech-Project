import React, { useState, useEffect } from 'react';
import './PendingTasks.css'; // Create a separate CSS file for styling
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import NavBar from './NavBar';

const PendingTasks = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [error,setError] = useState('');
  const navigate = useNavigate();
  const {approverRoleId} = useParams();
  console.log("id: ",approverRoleId);

  useEffect(() => {
    const fetchPendingLeaves = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/role-pending-leaves/${approverRoleId}`,{
          headers: {
            Authorization: `Bearer ${token}`, // Include the token as Bearer in the header
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setPendingLeaves(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message);
        }
      } catch {
        setError("An error occurred while fetching pending tasks.");
      }
    };

    if (approverRoleId) {
      fetchPendingLeaves();
    } else {
      setError("Approver role ID is missing.");
    }
  }, [approverRoleId]);

  const handleViewLeaveClick = (leaveId) => {
    // Navigate to a detailed leave view page for that leave
    navigate(`/leave-users/${leaveId}`);
  };

  return (
    <div className='pending-page'>
<NavBar />
   
    <div className="pending-tasks-container">
      
    <h2> Pending Tasks</h2>
      <div className="pending-tasks-section">
        <table className="pending-tasks-table">
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

export default PendingTasks;
