// src/components/EmployeeSidebar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './EmployeeSidebar.css';

const EmployeeSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        navigate('/');
    };

const handlerefresh=()=>{
    navigate('/employee-dashboard');
    window.location.reload();
}

    return (
        <aside className="employee-sidebar">
            <div className="sidebar-header">
                <h2>Employee Panel</h2>
            </div>
            <nav className="sidebar-nav">
                <Link to="/employee-dashboard" onClick={handlerefresh}>Dashboard</Link>
                {/* <Link to='/employee-interface'>Work</Link> */}
                {/* <Link to="/deadlines">Deadlines</Link> */}
                <Link to="/queries">Queries</Link>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </nav>
        </aside>
    );
};

export default EmployeeSidebar;
