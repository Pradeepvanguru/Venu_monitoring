// src/Components/Sidebar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';



const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        navigate('/');
    };

    const handlerefresh=(()=>{
        // Reload the page after successful submission
        navigate('/team-lead-interface')
        window.location.reload();
  })

    return (
        <aside className="employee-sidebar">
            <div className="sidebar-header">
                <h2>Team Lead Panel</h2>
            </div>
            <nav className="sidebar-nav">
              {/* <button className="btn text-dark " >&gt;</button>  */}
                <Link to="/team-lead-interface" onClick={handlerefresh}>Dashboard  &gt;</Link>
                <Link to="/create-task">Create Task &gt;</Link>
                {/* <Link to="/progress">Progress</Link> */}
                <Link to="/file-modules">File Modules &gt;</Link>
                <Link to='/queries'>Query &gt;</Link>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </nav>
        </aside>
    );
};

export default Sidebar;
