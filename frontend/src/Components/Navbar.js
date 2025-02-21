// src/Components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isAuthenticated, onLogout }) => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">Venu Team</Link>
            </div>
            <div className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
                {!isAuthenticated && (
                    <div className="navbar-dropdown">
                        <span>Login/Signup</span>
                        <div className="dropdown-content">
                            <Link to="/team-lead-auth">Team Lead</Link>
                            <Link to="/employee-auth">Employee</Link>
                        </div>
                    </div>
                )}
                {isAuthenticated && (
                    <button className="logout-btn" onClick={onLogout}>
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
