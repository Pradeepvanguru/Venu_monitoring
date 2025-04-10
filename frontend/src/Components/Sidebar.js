import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';


const Sidebar = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const fetchUserName = async () => {
            const token = localStorage.getItem('userToken');

            if (!token) {
                navigate('/'); // Redirect if not authenticated
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_URL}/api/logged-user`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUserName(response.data.name);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUserName();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };
    const handlerefresh = () => {
        navigate('/team-lead-interface')
        // window.location.reload();
    };

    return (
       <div>
         <aside className="employee-sidebar">
            <div className="sidebar-header">
                <h2>Team Lead Panel</h2><br></br>
                <i><p><i>Hello'👋</i> {userName || 'Loading...'}</p></i>
            </div>
            <nav className="sidebar-nav">
                <Link to="/team-lead-interface" onClick={handlerefresh}>Dashboard &gt;</Link>
                <Link to="/profile" className="dropdown-item">Profile &gt;</Link>
                <Link to="/queries">Team Chats &gt;</Link>
                <Link to="/create-task">Create Task &gt;</Link>
                {/* <Link to="/file-modules">File Modules &gt;</Link> */}
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </nav>
        </aside>
        
       </div>
    );
};

export default Sidebar;
