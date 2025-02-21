import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';


const EmployeeAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleToggle = () => {
        setIsLogin(!isLogin);
        setErrorMessage('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (data.message === 'Login successful') {
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('loggedInEmail', email); // Update the key to be consistent
                if (data.role === 'employee') {
                    navigate('/employee-dashboard');
                    window.location.reload();
                } else if (data.role === 'teamLead') {
                    navigate('/team-lead-interface');
                    window.location.reload();
                }
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('Server error. Please try again later.');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role: 'employee' }),
            });

            const data = await response.json();
            if (data.message === 'User registered successfully') {
                localStorage.setItem('userRole', 'employee');
                localStorage.setItem('loggedInEmail', email); // Update the key to be consistent
                navigate('/employee-interface');
                window.location.reload();
            } else {
                setErrorMessage(data.message);
            }
        } catch (error) {
            console.error('Signup error:', error);
            setErrorMessage('Server error. Please try again later.');
        }
    };

    return (
        <div className="auth-container">
            <h2>{isLogin ? 'Employee Login' : 'Employee Signup'}</h2>
            <form onSubmit={isLogin ? handleLogin : handleSignup}>
                {!isLogin && (
                    <input
                        type="text"
                        placeholder="Full Name"
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
                {!isLogin && (
                    <input
                        type="text"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                )}
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
                <p>
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <span onClick={handleToggle}>
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </span>
                </p>
            </form>
        </div>
    );
};

export default EmployeeAuth;
