import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './LeaveDetails.css'; // Optional, if you want to add custom styles

const LeaveDetails = () => {
  const { leaveId } = useParams();
  const [leaveDetails, setLeaveDetails] = useState(null);
  const [actionTaken, setActionTaken] = useState(null);
  const [approverNote, setApproverNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaveDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token missing. Please log in again.");
          return;
        }
        
        const response = await fetch(`http://localhost:5000/api/leave-details/${leaveId}`,{
          headers: {
            'Authorization': `Bearer ${token}`, // Include token in the Authorization header
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched Leave Details:', data);
          setLeaveDetails(data); // Set the fetched leave details to state
          setActionTaken(data.status);
        } else {
          const errorData = await response.json();
          setError(errorData.message); // Handle error if leave not found
        }
      } catch (error) {
        setError("An error occurred while fetching leave details.");
      }
    };

    fetchLeaveDetails();
  }, [leaveId]); // Fetch details when leaveId changes

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!leaveDetails) {
    return <div>Loading...</div>; // Show loading text while fetching data
  }

  const handleApprove = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token missing. Please log in again.");
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/approve-reject-leave/${leaveId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'approve', note: approverNote }),
      });
  
      if (response.ok) {
        const data = await response.json(); // Ensure the response is returned with updated data
        console.log('Approve Response:', data);  // Debugging line
  
        // Update leave status in the state
        setLeaveDetails((prev) => {
          // Log before and after state update for debugging
          console.log('Previous Leave Details:', prev);
          const updatedLeave = { ...prev, status: 'Approved' };
          console.log('Updated Leave Details:', updatedLeave);
          return updatedLeave; // Correctly update the leave details
        });
  
        // Update action taken state
        setActionTaken('Approved');  // Directly update the actionTaken state
        console.log('Action Taken after approval:', 'Approved');  // Log the state change
  
        alert(`Leave request approved with note: ${approverNote}`);
        navigate('/admin-pending-tasks');
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError("An error occurred while approving the leave request.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleReject = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");  // Adjust based on where you store the token
    if (!token) {
      setError("Token missing. Please log in again.");
      return;
    }
      const response = await fetch(`http://localhost:5000/api/approve-reject-leave/${leaveId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'reject', note: approverNote }),
      });

      if (response.ok) {
        const data = await response.json();  // Get the response data
        console.log('Reject Response:', data);  // Debugging line
  
        // Update leave status and action taken state
        setLeaveDetails((prev) => ({ ...prev, status: 'Rejected' }));
        setActionTaken('Rejected');  // Directly update the actionTaken state
        alert(`Leave request rejected with note: ${approverNote}`);
        navigate('/admin-pending-tasks');
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch {
      setError("An error occurred while rejecting the leave request.");
    } finally {
      setLoading(false);
    }
  };

  // Check if leave has been processed
  const isProcessed = actionTaken === "Approved" || actionTaken === "Rejected";
  console.log('Action Taken: ',actionTaken);
  return (
    <div className="leave-details-form-container">
      <h2>Leave Request Details</h2>
      
      <form className="leave-details-form">
        <label>
          <strong>Faculty Name:</strong>
          <input type="text" value={leaveDetails.faculty_name} readOnly />
        </label>

        <label>
          <strong>Leave Type:</strong>
          <input type="text" value={leaveDetails.leaveType} readOnly />
        </label>

        <label>
          <strong>Start Date:</strong>
          <input type="text" value={leaveDetails.start_date} readOnly />
        </label>

        <label>
          <strong>End Date:</strong>
          <input type="text" value={leaveDetails.end_date} readOnly />
        </label>

        <label>
          <strong>Reason:</strong>
          <textarea value={leaveDetails.reason} readOnly />
        </label>

        <label>
          <strong>Document Attached:</strong>
          {leaveDetails.attachment ? (
            <a href={`/path-to-documents/${leaveDetails.attachment}`} target="_blank" rel="noopener noreferrer">
              {leaveDetails.attachment}
            </a>
          ) : (
            <span>No document attached</span>
          )}
        </label>

        {/* Note Section for the Approver */}
        <label>
          <strong>Approver's Note:</strong>
          <textarea
            value={approverNote}
            onChange={(e) => setApproverNote(e.target.value)}
            placeholder="Add a note (optional)"
            disabled={isProcessed} // Disable textarea after action is taken
          />
        </label>

        {/* Approve and Reject Buttons */}
        <div className="action-section">
          {isProcessed ? (
            <div className="action-taken">
              <strong>Action Taken: {actionTaken}</strong>
            </div>
          ) : (
            <div className="action-buttons">
              <button type="button" onClick={handleApprove} className="approve-btn" disabled={loading}>
                {loading ? 'Approving...' : 'Approve'}
              </button>
              <button type="button" onClick={handleReject} className="reject-btn" disabled={loading}>
                {loading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default LeaveDetails;
