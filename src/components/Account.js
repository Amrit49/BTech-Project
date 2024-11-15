import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import './Account.css'; // Link your CSS file here

const Account = () => {
  const [userDetails,setUserDetails] = useState({});
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // For editing fields
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false); // For password change modal


  const [designationDetails, setDesignationDetails] = useState({
    facultyEmail: '',
    startDate: '',
    endDate: '',
  });

  const [passwordDetails, setPasswordDetails] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  
  useEffect(() => {
    fetchUserDetails();
  },[]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/user/profile`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUserDetails(data);
      console.log(data)
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };
  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const togglePasswordModalVisibility = () => {
    setIsPasswordModalVisible(!isPasswordModalVisible);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleDesignationChange = (e) => {
    const { name, value } = e.target;
    setDesignationDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Role Designation Details:', designationDetails);
    // Submit the designationDetails to the backend or API
    toggleFormVisibility();
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordDetails.newPassword === passwordDetails.confirmNewPassword) {
      console.log('Password details:', passwordDetails);
      // Submit passwordDetails to backend to change the password
      togglePasswordModalVisibility();
    } else {
      alert("New Password and Confirm Password do not match.");
    }
  };

  return (
    <div className="account-page">
      <NavBar />

      <div className="account-info-box">
        <h2 className="account-heading">PROFILE</h2>
        <div className="user-details-box">
          <div className="field-wrapper">
            <p>NAME</p>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={userDetails.name}
                onChange={handleInputChange}
              />
            ) : (
              <div className="value">{userDetails.name}</div>
            )}
          </div>

          <div className="field-wrapper">
            <p>EMAIL</p>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={userDetails.email}
                onChange={handleInputChange}
              />
            ) : (
              <div className="value">{userDetails.email}</div>
            )}
          </div>

          <div className="field-wrapper">
            <p>PHONE NUMBER</p>
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={userDetails.phone}
                onChange={handleInputChange}
              />
            ) : (
              <div className="value">{userDetails.phone}</div>
            )}
          </div>

          <div className="field-wrapper">
            <p>ADDRESS</p>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={userDetails.address}
                onChange={handleInputChange}
              />
            ) : (
              <div className="value">{userDetails.address}</div>
            )}
          </div>

          <div className="field-wrapper">
            <p>DATE OF BIRTH</p>
            <div className="value"> {userDetails.date_of_birth &&
                new Date(userDetails.date_of_birth).toLocaleDateString()}</div>
          </div>

          <div className="field-wrapper">
            <p>ROLE</p>
            <div className="value">{userDetails.role || 'None'}</div>
          </div>
          
          {userDetails.isFaculty && (
            <div className='field-wrapper'>
              <p> DEPARTMENT</p>
              <div className='value'>{userDetails.department || 'N/A'}</div>
            </div>
          )}
          <div className='button-section'>
            <button className="edit-btn" onClick={toggleEditing}>
              {isEditing ? 'Save' : 'Edit'}
            </button>
            {userDetails.role && (
            <button className="designate-role-btn" onClick={toggleFormVisibility}>
              Designate
            </button>
            )}
            <button className="change-password-btn" onClick={togglePasswordModalVisibility}>
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Role Designation Form */}
      {isFormVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-btn" onClick={toggleFormVisibility}>&times;</span>
            <form className="designation-form-box" onSubmit={handleSubmit}>
              <h3 className="form-heading">DESIGNATE</h3>
              <div className="form-group">
                <label htmlFor="facultyEmail">Email</label>
                <input
                  type="text"
                  id="facultyEmail"
                  name="facultyEmail"
                  value={designationDetails.facultyEmail}
                  onChange={handleDesignationChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="startDate">START DATE</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={designationDetails.startDate}
                  onChange={handleDesignationChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">END DATE</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={designationDetails.endDate}
                  onChange={handleDesignationChange}
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {isPasswordModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-btn" onClick={togglePasswordModalVisibility}>&times;</span>
            <form className="password-form-box" onSubmit={handlePasswordSubmit}>
              <h3 className="form-heading">Change Password</h3>

              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordDetails.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordDetails.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={passwordDetails.confirmNewPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
