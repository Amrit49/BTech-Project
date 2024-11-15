import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './LeaveDetailsUsers.css'; // Optional, if you want to add custom styles

const LeaveDetailsUsers = () => {
  const { leaveId ,approverRoleId} = useParams();
  const [leaveDetails, setLeaveDetails] = useState(null);
  const [actionTaken, setActionTaken] = useState("Pending");
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
  
        const response = await fetch(`http://localhost:5000/api/leave-users/${leaveId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched Leave Details:", data); // Add this log to confirm the response
  
          setLeaveDetails(data);  // Set the leave details
          console.log("Setting Action Taken to:", data.status); // Log the status before setting the state
  
          // Update the action taken state based on status
          setActionTaken(data.status === "Not Processed" ? "Pending" : data.status);
        } else {
          const errorData = await response.json();
          setError(errorData.message);  // Handle error if leave not found
        }
      } catch (error) {
        setError("An error occurred while fetching leave details.");
      }
    };
  
    fetchLeaveDetails();
  }, [leaveId]);  // Re-run the effect when leaveId changes
  useEffect(() => {
    console.log("Action Taken Updated:", actionTaken);  // Log whenever actionTaken changes
  }, [actionTaken]);

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
      
      const response = await fetch(`http://localhost:5000/api/approve-reject-leave-user/${leaveId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'approve', note: approverNote }),
      });
  
      if (response.ok) {
        // const data = await response.json(); // Ensure the response is returned with updated data
        // console.log('Approve Response:', data);  // Debugging line
  
        // // Update leave status in the state
        // setLeaveDetails((prev) => {
        //   // Log before and after state update for debugging
        //   console.log('Previous Leave Details:', prev);
        //   const updatedLeave = { ...prev, status: 'Approved' };
        //   console.log('Updated Leave Details:', updatedLeave);
        //   return updatedLeave; // Correctly update the leave details
        // });
  
        const updatedStatus = 'Approved'; // The status you want to set
        setLeaveDetails((prev) => ({
          ...prev,
          status: updatedStatus,
          action_taken: updatedStatus,
        }));
    
            // setLeaveDetails(data);  // This updates all the leave details from the response
        setActionTaken(updatedStatus);
      
        
        // setActionTaken('Approved');  // Directly update the actionTaken state
        console.log('Action Taken after approval:', 'Approved');  // Log the state change
  
        alert(`Leave request approved with note: ${approverNote}`);
        setLoading(false);
        navigate(`/role-pending-tasks/${approverRoleId}`);

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

  // const handleApprove = async () => {
  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       setError("Token missing. Please log in again.");
  //       return;
  //     }
  
  //     const response = await fetch(`http://localhost:5000/api/approve-reject-leave-user/${leaveId}`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ action: 'approve', note: approverNote }),
  //     });
  
  //     if (response.ok) {
  //       const updatedStatus = 'Approved';
  //       setLeaveDetails((prev) => ({
  //         ...prev,
  //         status: updatedStatus,
  //       }));
  //       setActionTaken(updatedStatus);  // Update state immediately
  
  //       // Navigate or force re-render after state update
  //       navigate(`/role-pending-tasks/${approverRoleId}`);
  //     } else {
  //       const errorData = await response.json();
  //       setError(errorData.message);
  //     }
  //   } catch (error) {
  //     setError("An error occurred while approving the leave request.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  

  const handleReject = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");  // Adjust based on where you store the token
    if (!token) {
      setError("Token missing. Please log in again.");
      return;
    }
      const response = await fetch(`http://localhost:5000/api/approve-reject-leave-user/${leaveId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'reject', note: approverNote }),
      });

      if (response.ok) {
        // const data = await response.json();  // Get the response data
        // console.log('Reject Response:', data);  // Debugging line
  
        // // Update leave status and action taken state
        // setLeaveDetails((prev) => ({ ...prev, status: 'Rejected' }));
        const updatedStatus = 'Rejected'; // The status you want to set
  setLeaveDetails((prev) => ({
    ...prev,
    status: updatedStatus,
    action_taken: updatedStatus,
  }));
        setActionTaken(updatedStatus);  // Directly update the actionTaken state
        alert(`Leave request rejected with note: ${approverNote}`);
        setLoading(false);
        navigate(`/role-pending-tasks/${approverRoleId}`);
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

  // const handleReject = async () => {
  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       setError("Token missing. Please log in again.");
  //       return;
  //     }
  
  //     const response = await fetch(`http://localhost:5000/api/approve-reject-leave-user/${leaveId}`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ action: 'reject', note: approverNote }),
  //     });
  
  //     if (response.ok) {
  //       const updatedStatus = 'Rejected';
  //       setLeaveDetails((prev) => ({
  //         ...prev,
  //         status: updatedStatus,
  //       }));
  //       setActionTaken(updatedStatus);  // Update state immediately
  
  //       // Navigate or force re-render after state update
  //        navigate(`/role-pending-tasks/${approverRoleId}`);
  //     } else {
  //       const errorData = await response.json();
  //       setError(errorData.message);
  //     }
  //   } catch (error) {
  //     setError("An error occurred while rejecting the leave request.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  

  // Check if leave has been processed
  const isProcessed = actionTaken === "Approved" || actionTaken === "Rejected";
  console.log('Action Taken: ',actionTaken);
  return (
    <div className="leave-details-users-form-container">
      <h2>Leave Request Details</h2>
      
      <form className="leave-details-users-form">
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

        {leaveDetails.previousNotes && leaveDetails.previousNotes.length > 0 && (
        <div className="previous-notes-section">
          <h3>Previous Approver Notes</h3>
          <ul>
            {leaveDetails.previousNotes.map((note, index) => (
              <li key={index}>
                <strong>{note.approverName}</strong> : {note.note}
              </li>
            ))}
          </ul>
        </div>
      )}

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

        {/* <div className="action-section">
            {!isProcessed && (
                <div className="action-buttons">
                    <button type="button" onClick={handleApprove} className="approve-btn" disabled={loading}>
                        {loading ? 'Approving...' : 'Approve'}
                    </button>
                    <button type="button" onClick={handleReject} className="reject-btn" disabled={loading}>
                        {loading ? 'Rejecting...' : 'Reject'}
                    </button>
                </div>
            )}
            {isProcessed && (
                <div className="action-taken">
                    <strong>Action Taken: {leaveDetails.status}</strong>
                </div>
            )}
        </div> */}

{isProcessed ? (
  <div className="action-taken">
    <strong>Action Taken: {actionTaken}</strong>
  </div>
) : (
  <div className="action-buttons">
    <button onClick={handleApprove} disabled={loading} className='approve-btn'>Approve</button>
    <button onClick={handleReject} disabled={loading} className='reject-btn'>Reject</button>
  </div>
)}




      </form>
    </div>
  );
};

export default LeaveDetailsUsers;




