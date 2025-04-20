import { FiDatabase } from "react-icons/fi"; 
import { CgProfile } from "react-icons/cg"; 
import { HiOutlineChatAlt2 } from "react-icons/hi"; 
import { MdOutlineLogout } from "react-icons/md"; 
import { FcHome } from "react-icons/fc"; 
import React,{ useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './EmployeeSidebar.css';
import axios from 'axios';


const EmployeeSidebar = () => {
    const navigate = useNavigate();
    const [profilePhoto, setProfilePhoto] = useState('');
    // const [userName, setUserName] = useState('');
    const userName=localStorage.getItem("userName")

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
        navigate('/employee-dashboard');
        // window.location.reload();
    };

    
    

    return (
       
        
        
        <aside className="employee-sidebar">
             
            <div className="sidebar-header">
            
                <h2>Teammate Panel</h2>
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
                            marginRight: '45px',
                            border:'1px solid white',
                        }}
                    />
                    <span className='fs-5 font-weight-semibold'>{userName || 'Loading...'}</span>
                </div>
            </div>
            <nav className="sidebar-nav">
                <Link to="/employee-dashboard" onClick={handlerefresh}> <FcHome fontSize={20} /> Dashboard</Link>
                <Link to="/profile" className="dropdown-item"><CgProfile fontSize={20}/> Profile </Link>
                 <Link to="/queries"> <HiOutlineChatAlt2 fontSize={20} /> Team Chats </Link>
                 <Link to="/file-modules"><FiDatabase fontSize={20}/> Tasks Data </Link>
                <button className="logout-btn" onClick={handleLogout}><MdOutlineLogout fontSize={20} /> Logout</button>
            </nav>
        </aside>
    );
};

export default EmployeeSidebar;
