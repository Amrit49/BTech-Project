import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import './AdminProfile.css'; // Link your CSS file here
import AdminNavbar from './AdminNavbar';
import { useParams } from 'react-router-dom';

const AdminProfile = () => {
  const { userId } = useParams();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // For editing fields
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false); // For password change modal

  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    role: '',
  });

  const [passwordDetails, setPasswordDetails] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    // Fetch user details when component mounts
    const fetchAdminProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/admin-profile/${userId}`);
        const data = await response.json();
        setUserDetails({
          name: data.full_name,
          email: data.email,
          phone: data.phone_no,
          address: data.address,
          dateOfBirth: data.date_of_birth,
          role: data.role_name,
        });
      } catch (error) {
        console.error('Error fetching admin profile:', error);
      }
    };

    if (userId) fetchAdminProfile();
  }, [userId]);

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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
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
      <AdminNavbar />

      <div className="account-info-box admin">
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
            <div className="value">{new Date(userDetails.dateOfBirth).toLocaleDateString()}</div>
          </div>

          <div className="field-wrapper">
            <p>ROLE</p>
            <div className="value">{userDetails.role}</div>
          </div>

          <div className="button-section">
            <button className="edit-btn" onClick={toggleEditing}>
              {isEditing ? 'Save' : 'Edit'}
            </button>
            <button className="change-password-btn" onClick={togglePasswordModalVisibility}>
              Change Password
            </button>
          </div>
        </div>
      </div>

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

export default AdminProfile;
