import { MdLogout } from "react-icons/md"; 
import { BiAddToQueue } from "react-icons/bi"; 
import { SiLivechat } from "react-icons/si"; 
import { CgProfile } from "react-icons/cg"; 
import { FcHome } from "react-icons/fc"; 
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [profilePhoto, setProfilePhoto] = useState('');

    useEffect(() => {
        const fetchUserDetails = async () => {
            const token = localStorage.getItem('userToken');

            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_URL}/api/logged-user`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUserName(response.data.name);
                setProfilePhoto(response.data.profilePhoto); // this is "uploads/filename.jpg"
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUserDetails();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handlerefresh = () => {
        navigate('/team-lead-interface');
    };

    return (
        <aside className="employee-sidebar">
            <div className="sidebar-header text-center">
                <h2>Team Lead Panel</h2>
                <div className="d-flex align-items-center justify-content-center mt-3">
                    <img
                        src={profilePhoto}
                        alt="Profile"
                        className="profile-image"
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            marginRight: '30px',
                            border:'1px solid white',
                        }}
                    />
                    <span className='fs-5 font-weight-semibold '>{userName || 'Loading...'}</span>
                </div>
            </div>

            <nav className="sidebar-nav mt-4">
                <Link to="/team-lead-interface" onClick={handlerefresh}><FcHome fontSize={20} /> Dashboard </Link>
                <Link to="/profile"> <CgProfile fontSize={20}/> Profile </Link>
                <Link to="/queries"><SiLivechat fontSize={20} /> Team Chats </Link>
                <Link to="/create-task"><BiAddToQueue fontSize={20} /> Create Task </Link>
                <button className="logout-btn mt-3" onClick={handleLogout}><MdLogout  fontSize={20}/> Logout</button>
            </nav>
        </aside>
    );
};

export default Sidebar;
