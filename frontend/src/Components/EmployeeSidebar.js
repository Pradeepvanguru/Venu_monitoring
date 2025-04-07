import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './EmployeeSidebar.css';

const EmployeeSidebar = () => {
    const navigate = useNavigate();
    // const [userName, setUserName] = useState('');
    const userName=localStorage.getItem("userName")

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handlerefresh = () => {
        navigate('/employee-dashboard');
        // window.location.reload();
    };

    return (
        <aside className="employee-sidebar">
            <div className="sidebar-header">
                <h2>Employee Panel</h2>
                <br />
                <p>Hi...! {userName || 'loading'}</p>
            </div>
            <nav className="sidebar-nav">
                <Link to="/employee-dashboard" onClick={handlerefresh}>Dashboard</Link>
                <Link to="/profile" className="dropdown-item">Profile &gt;</Link>
                 <Link to="/queries">Team Chats &gt;</Link>
                 <Link to="/file-modules">File Modules &gt;</Link>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </nav>
        </aside>
    );
};

export default EmployeeSidebar;
