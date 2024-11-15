import React, { useEffect, useState } from 'react';
import './EmployeeSection.css'; // Import the CSS for styling
import AdminNavbar from './AdminNavbar';

const EmployeeSection = () => {
    // State for employees list, sorting, and department filter
    const [employees, setEmployees] = useState([]);
    const [sortType, setSortType] = useState(''); // State for sorting by type (faculty/staff)
    const [departmentId, setDepartmentId] = useState(''); // State for department filter
    const [departments, setDepartments] = useState([]); // State for department list
    const [roles, setRoles] = useState([]); // Define roles
    const [employeeTypes, setEmployeeTypes] = useState([]); // Employee types

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/departments');
                const data = await response.json();
                setDepartments(data);
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };
        fetchDepartments();
    }, []);

    useEffect(() => {
        const fetchEmployeeTypesAndRoles = async () => {
            try {
                const employeeTypesResponse = await fetch('http://localhost:5000/api/employeeTypes');
                const rolesResponse = await fetch('http://localhost:5000/api/roles');
                const employeeTypesData = await employeeTypesResponse.json();
                const rolesData = await rolesResponse.json();
                setEmployeeTypes(employeeTypesData);
                setRoles(rolesData);
            } catch (error) {
                console.error('Error fetching employee types or roles:', error);
            }
        };
        fetchEmployeeTypesAndRoles();
    }, []);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/employees?sort_by_type=${sortType}&department_id=${departmentId}`
                );
                const data = await response.json();
                setEmployees(data.message ? [] : data); // Set fetched employees
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };
        fetchEmployees();
    }, [sortType, departmentId]); // Fetch on sort/filter change

    // Modal state for showing/hiding the add employee form
    const [showModal, setShowModal] = useState(false);

    // Form state for adding a new employee
    const [newEmployee, setNewEmployee] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        email: '',
        dob: '',
        department: '',
        role: '',
        employeeType: '',
        password: '',
    });

    // Function to handle input changes in the form
    const handleInputChange = (e) => {
        setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
    };

    // Function to handle adding a new employee (local state update)
    const handleAddEmployee = async () => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@iiitg\.ac\.in$/;
        if (!emailRegex.test(newEmployee.email)) {
            alert('Email must be of domain @iiitg.ac.in');
            return;
        }
        if (
            newEmployee.first_name &&
            newEmployee.last_name &&
            newEmployee.phone &&
            newEmployee.address &&
            newEmployee.email &&
            newEmployee.dob &&
            newEmployee.department &&
            newEmployee.role &&
            newEmployee.employeeType &&
            newEmployee.password
        ) {
            try {
                const response = await fetch('http://localhost:5000/api/employees', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newEmployee),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message}`);
                    return;
                }
                const nextId = employees.length ? employees[employees.length - 1].user_id + 1 : 1;
                setEmployees([...employees, { user_id: nextId, ...newEmployee }]);
                setNewEmployee({
                    first_name: '',
                    last_name: '',
                    phone: '',
                    address: '',
                    email: '',
                    dob: '',
                    department: '',
                    role: '',
                    employeeType: '',
                    password: '',
                });
                setShowModal(false); // Hide modal after adding
            } catch (error) {
                console.error('Error adding employee:', error);
                alert('Failed to add employee. Please try again.');
            }
        }
    };

    // Function to close the modal
    const handleModalClose = () => {
        setShowModal(false);
    };

    // Function to remove an employee
    const handleRemoveEmployee = (id) => {
        setEmployees(employees.filter((employee) => employee.user_id !== id));
    };

    return (
        <div className="employee-section">
            {/* Sidebar Navigation */}
            <AdminNavbar />

            {/* Main Content Area */}
            <div className="main-content">
                <h2 className="list-heading">Current Employees</h2>
                <button className="add-employee-btn" onClick={() => setShowModal(true)}>
                    Add Employee
                </button>

                {/* Sorting and Filtering Controls */}
                <div className="sorting-controls">
                    <select
                        value={sortType}
                        onChange={(e) => setSortType(e.target.value)}
                        className="sort-dropdown"
                    >
                        <option value="">Sort by Type</option>
                        <option value="faculty">Faculty</option>
                        <option value="staff">Staff</option>
                    </select>
                </div>

                {/* Employee Table */}
                <div className="employee-table-container">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee) => (
                                <tr key={employee.user_id}>
                                    <td>{employee.user_id}</td>
                                    <td>{employee.name}</td>
                                    <td>{employee.phone_no}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.department}</td>
                                    <td>
                                        <button
                                            className="remove-employee-btn"
                                            onClick={() => handleRemoveEmployee(employee.user_id)}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Adding Employee */}
            {showModal && (
                <div className={`modal ${showModal ? 'show' : ''}`}>
                    <div className="modal-content">
                        <h2>Add New Employee</h2>
                        <form className="employee-form">
                            <label>First Name</label>
                            <input type="text" name="first_name" value={newEmployee.first_name} onChange={handleInputChange} required />
                            <label>Last Name</label>
                            <input type="text" name="last_name" value={newEmployee.last_name} onChange={handleInputChange} required />
                            <label>Phone No.</label>
                            <input type="text" name="phone" value={newEmployee.phone} onChange={handleInputChange} required />
                            <label>Address</label>
                            <input type="text" name="address" value={newEmployee.address} onChange={handleInputChange} required />
                            <label>Email</label>
                            <input type="email" name="email" value={newEmployee.email} onChange={handleInputChange} required />
                            <label>Date of Birth</label>
                            <input type="date" name="dob" value={newEmployee.dob} onChange={handleInputChange} required />
                            <label>Employee Type</label>
                            <select name="employeeType" value={newEmployee.employeeType} onChange={handleInputChange} required>
                                <option value="">Select Type</option>
                                {employeeTypes.map((type) => (
                                    <option key={type.employee_type_id} value={type.type_name}>{type.type_name}</option>
                                ))}
                            </select>
                            <label>Department</label>
                            <select name="department" value={newEmployee.department} onChange={handleInputChange} required>
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.department_id} value={dept.department_name}>{dept.department_name}</option>
                                ))}
                            </select>
                            <label>Role</label>
                            <select name="role" value={newEmployee.role} onChange={handleInputChange} required>
                                <option value="">Select role</option>
                                {roles.map((role) => (
                                    <option key={role.role_id} value={role.role_name}>{role.role_name}</option>
                                ))}
                            </select>
                            <label>Password</label>
                            <input type="password" name="password" value={newEmployee.password} onChange={handleInputChange} required />
                            <button type="button" onClick={handleAddEmployee}>Add Employee</button>
                            <button type="button" onClick={handleModalClose}>Close</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeSection;
