import React ,{useEffect,useState} from 'react';
import { FaUsers, FaCalendarAlt } from 'react-icons/fa'; // Icons
import './Admin.css'; // Import CSS for styling
import AdminNavbar from './AdminNavbar';

const AdminDashboard = () => {
    const [leaveTypesCount, setLeaveTypesCount] = useState(0);
    const [employeesCount, setEmployeesCount] = useState(0);
    const [staffCount, setStaffCount] = useState(0);

    useEffect(() =>{
        fetch('http://localhost:5000/api/leave-types/count')
            .then(response => response.json())
            .then(data => setLeaveTypesCount(data.count))
            .catch(error => console.error("Error fetching the count:",error));


        fetch('http://localhost:5000/api/employees/count')
            .then(response => response.json())
            .then(data => setEmployeesCount(data.count))
            .catch(error => console.error("Error fetching the count:",error));
        
        fetch('http://localhost:5000/api/staff/count')
            .then(response => response.json())
            .then(data => setStaffCount(data.count))
            .catch(error => console.error("Error fetching the count:",error));
    }, []);
    return (
        <div className="admin-dashboard">
            {/* Navbar */}
            {/* <div className="navbar"> */}
              <AdminNavbar />
            {/* </div> */}

            <div className="dashboard-heading">
                <h1>ADMIN DASHBOARD</h1>
            </div>
            {/* Dashboard Cards */}
            <div className="stats-grid">
                <div className="admin-stat-card">
                    <FaCalendarAlt className="card-icon" />
                    <h2>Available Leave Types</h2>
                    <p className="stat-number">{leaveTypesCount}</p>
                    <p>Leave Types</p>
                </div>
                <div className="admin-stat-card">
                    <FaUsers className="card-icon" />
                    <h2>Registered Faculty</h2>
                    <p className="stat-number">{employeesCount}</p>
                    <p>Active Faculty</p>
                </div>
                <div className="admin-stat-card centered-card">
                <FaUsers className="card-icon" />
                    <h2>Registered Staff</h2>
                    <p className="stat-number">{staffCount}</p>
                    <p>Active Staff</p>
                </div>
                {/* <div className="stat-card">
                    <FaClock className="card-icon" />
                    <h2>Pending Application</h2>
                    <p className="stat-number">4</p>
                    <p>Pending</p>
                </div>
                <div className="stat-card">
                    <FaTimesCircle className="card-icon" />
                    <h2>Declined Application</h2>
                    <p className="stat-number">2</p>
                    <p>Declined</p>
                </div>
                <div className="stat-card">
                    <FaCheckCircle className="card-icon" />
                    <h2>Approved Application</h2>
                    <p className="stat-number">6</p>
                    <p>Approved</p>
                </div> */}
            </div>
        </div>
    );
};

export default AdminDashboard;
