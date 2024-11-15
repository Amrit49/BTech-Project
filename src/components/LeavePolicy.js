import React, { useState,useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import './LeavePolicy.css'; // Separate CSS for this page's styles

// Sample leave policy data


const LeavePolicy = () => {

  const [leavePolicies, setLeavePolicies] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedLeave, setUpdatedLeave] = useState({});


  useEffect(() => {
    const fetchLeavePolicies = async () => {
      const response = await fetch('http://localhost:5000/api/leave-policies');
      const data = await response.json();
      setLeavePolicies(data);
    };

    fetchLeavePolicies();
  }, []);



  const openModal = (leave) => {
    setSelectedLeave(leave);
    setUpdatedLeave(leave);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLeave(null);
    setIsEditing(false);
  };

  const handleUpdateClick = () => {
    setIsEditing(true);
  }

  const handleInputChange = (e) => {
    const {name,value} = e.target;
    setUpdatedLeave((prev) => ({
        ...prev,
        [name]: value,
      }));
  }

  const handleSaveChanges = async () => {
    // Logic to save the updated leave policy to the backend
    await fetch(`http://localhost:5000/api/leave-policies/${updatedLeave.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedLeave),
    });

    // Update the local state
    setLeavePolicies((prev) =>
      prev.map((leave) => (leave.id === updatedLeave.id ? updatedLeave : leave))
    );

    setIsEditing(false);
    closeModal(); // Close modal after saving
  };
  return (
    <div className="leave-policy-page">
      {/* Sidebar Navigation */}
      <AdminNavbar />

      {/* Main Content */}
      <div className="main-content">
        <h2 className='leave-heading'>Leave Policies</h2>
        <div className="leave-cards">
          {leavePolicies.map((leave) => (
            <div className="leave-card" key={leave.id}>
              <h3>{leave.type_name} </h3>
              <p>Eligibility: {leave.description}</p>
              <button className="more-info-btn" onClick={() => openModal(leave)}>
                More Info
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for detailed leave policy */}
      {showModal && selectedLeave && (
        <div className="modal">
          <div className="modal-content">
            <h3>{updatedLeave.type_name} Leave Details</h3>

            <p><strong>Description:</strong></p>
            <textarea
              name="description"
              value={updatedLeave.description}
              onChange={handleInputChange}
              disabled={!isEditing} // Enable textarea only when editing
            />

<p><strong>Allocation:</strong></p>
            <input
              type="number"
              name="allocation"
              value={updatedLeave.allocation}
              onChange={handleInputChange}
              disabled={!isEditing}
            />

<p><strong>Carry Over:</strong></p>
            <input
              type="text"
              name="carry_over"
              value={updatedLeave.carry_over}
              onChange={handleInputChange}
              disabled={!isEditing}
            />

            <p><strong>Pay Status:</strong></p>
            <input
              type="text"
              name="pay_status"
              value={updatedLeave.pay_status}
              onChange={handleInputChange}
              disabled={!isEditing}
            />

            <p><strong>Minimum Service Required:</strong></p>
            <input
              type="number"
              name="min_service_required"
              value={updatedLeave.min_service_required}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
<div className="modal-buttons">
              {!isEditing ? (
                <>
                  <button onClick={handleUpdateClick}>Update Policy</button>
                  <button onClick={closeModal}>Close</button>
                </>
              ) : (
                <>
                  <button onClick={handleSaveChanges}>Save Changes</button>
                  <button onClick={closeModal}>Cancel</button>
                </>
              )}
            </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default LeavePolicy;