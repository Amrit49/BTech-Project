import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaCalendarAlt,FaBell, FaUser,FaSignOutAlt,FaTasks } from 'react-icons/fa';
import './AdminNavbar.css';
import logo from '../assets/logo.png';


const AdminNavbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };
    return (
        <div className="sidebar">
            <div className="logo">
                <img src = {logo} alt='logo' />
            </div>
            <ul className="admin-nav-links">
                <li>
                    <Link to="/admin">
                    <FaHome className="icon" /> Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/employee">
                    <FaUsers className="icon" /> Employee Section
                    </Link>
                </li>
                <li>
                    <Link to="/leave-policy">
                    <FaCalendarAlt className="icon" /> Leave Types
                    </Link>
                </li>

                <li>
                    <Link to="/admin-pending-tasks">
                        <FaTasks className='icon' /> Tasks
                    </Link>
                </li>
                <li>
                    <Link to="/admin-notifications">
                        <FaBell className='icon' /> Notifications
                    </Link>
                </li>
    
                <li>
                    <Link to="/admin-profile">
                    <FaUser className="icon" /> Profile

                    </Link>
                </li>
                <li>

                    <Link to="/ ">
                    <FaSignOutAlt className="icon" /> Logout

                    </Link>
                    
                </li>
            </ul>
        </div>
    );
};

export default AdminNavbar;
