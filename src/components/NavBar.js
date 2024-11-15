import React , {useEffect, useState} from 'react';
import './NavBar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../assets/logo.png';
import { FaBell, FaTasks, FaCalendarCheck, FaUser,FaSignOutAlt,FaHistory } from 'react-icons/fa';
import {useLocation, useNavigate} from 'react-router-dom';

const NavBar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [noificationCount,setNotificationCount] = useState(3);
    const navigate = useNavigate();
    const location = useLocation();
    const roleId = localStorage.getItem('roleposition_id');
    const toggleDropdown =() => {
        setDropdownOpen(!dropdownOpen);
    }

    const handleProfileClick = () =>{
        navigate('/account');
    };
    const handleLogoutClick =()=>{
        localStorage.removeItem("token");
        navigate('/');
    };

    const handleNotificationClick = () => {
        
        navigate('/notification');
    };

    const handleLeaveHistoryClick = () => {
        navigate('/multicalendar');
    };

    const handleStatusClick = () => {
        navigate('/leave-status');
    };

    const handleTasksClick = () => {
        const roleId = localStorage.getItem('roleposition_id');
        console.log("Navigating to: /role-pending-tasks/" + roleId); // Add this log
        if (roleId) {
            navigate(`/role-pending-tasks/${roleId}`);
        }
    };
    
    const handleLogoClick = () => {
        navigate('/main');
    };

    useEffect(() => {
        if(location.pathname === '/notification'){
            setNotificationCount(0);
        }
    }, [location]);
    return (
    <nav className='navbar'>
        <div className='navbar-container'>
            <div className='navbar-logo' onClick={handleLogoClick} style={{cursor: 'pointer'}}>
                <img src={logo} alt='college logo'/>
            </div>

            <ul className='nav-links'>
                <li className='notification-icon' onClick={handleNotificationClick}>
                    <a href='#' title='Notifications'>
                        <FaBell />
                        {noificationCount > 0 && (
                            <span className='notification-badge'>
                                {noificationCount}
                            </span>
                        )}
                    </a>
                </li>
                {roleId && roleId !== 'null' && (
                <li onClick={handleTasksClick}>
                    <a href='#' title='Tasks'>
                        <FaTasks />
                    </a>
                </li>
                )}

                <li onClick={handleStatusClick}>
                    <a href='#' title='Leave Status'>
                    <FaCalendarCheck />
                    </a>
                </li>
                
                <li onClick={handleLeaveHistoryClick}>
                    <a href='#' title='Leave History'>
                        <FaHistory />
                    </a>
                </li>
                <li className='navbar-dropdown' onClick={toggleDropdown}>
                    <a href='#' className='dropdown-toggle' title='Account'>
                        <FaUser />
                    </a>
                    {dropdownOpen && (
                        <div className='dropdown-menu'>
                            <div className='upper-triangle'></div>
                                <ul className='dropdown-list'>
                                    <li onClick={handleProfileClick}>
                                        <FaUser className="dropdown-list-icon" />
                                        <span>PROFILE</span>
                                    </li>
                                    <li onClick={handleLogoutClick}>
                                        <FaSignOutAlt className="dropdown-list-icon" />
                                        <span>LOGOUT</span>
                                    </li>
                                </ul>
                        </div>
                    )}
                </li>
            </ul>

      </div>
    </nav>
  );
};

export default NavBar;
