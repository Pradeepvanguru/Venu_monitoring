import { RiContactsLine } from "react-icons/ri"; 
import { BiBulb } from "react-icons/bi"; 
import { GoHome } from "react-icons/go"; 
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
                <Link to="/"><GoHome /> Home</Link>
                <Link to="/about"> <BiBulb /> About</Link>
                <Link to="/contact"><RiContactsLine /> Contact</Link>
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
