import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeamLeadAuth.css';

const TeamLeadAuth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const switchMode = () => {
        setIsSignup((prevIsSignup) => !prevIsSignup);
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        const authData = { email, password, role: 'team-lead' };
    
        if (isSignup) {
            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }
            authData.name = name;
            try {
                const response = await axios.post(`${process.env.REACT_APP_URL}/auth/signup`, authData);
                alert(response.data.message);
                setIsSignup(false);
            } catch (error) {
                if (error.response && error.response.data) {
                    console.error(error.response.data.message);
                } else {
                    console.error("Signup failed. Please check your connection or try again later.");
                }
            }
        } else {
            try {
                const response = await axios.post(`${process.env.REACT_APP_URL}/auth/login`, authData);
                localStorage.setItem('userToken', response.data.token);
                localStorage.setItem('userRole', 'team-lead');
                navigate('/team-lead-interface');
            } catch (error) {
                if (error.response && error.response.data) {
                    console.error(error.response.data.message);
                } else {
                    console.error("Login failed. Please check your connection or try again later.");
                }
            }
        }
    };
    
    return (
        <div className="team-lead-auth">
            <form onSubmit={handleAuth}>
                <h2>{isSignup ? 'Team Lead Signup' : 'Team Lead Login'}</h2>
                {isSignup && (
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                )}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password must be 6 or more characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {isSignup && (
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                )}
                <button type="submit">{isSignup ? 'Sign Up' : 'Login'}</button>
                <p onClick={switchMode}>
                    {isSignup ? 'Already have an account? Login' : 'Don’t have an account? Sign Up'}
                </p>
            </form>
        </div>
    );
};

export default TeamLeadAuth;
