import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { message, notification } from 'antd';
import "./Auth.css"

const EmployeeAuth = () => {
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
        const authData = { email, password, role: 'employee' };

        if (isSignup) {
            if (password !== confirmPassword) {
                notification.error({
                    message: 'Error',
                    description: 'Passwords do not match!',
                });
                return;
            }
            authData.name = name;
            try {
                const response = await axios.post(`${process.env.REACT_APP_URL}/auth/signup`, authData);
                notification.success({
                    message: 'Success',
                    description: response.data.message,
                });
                setIsSignup(false);
            } catch (error) {
                notification.error({
                    message: 'Error',   
                    description: error.response.data.message || 'Signup failed. Please try again.'
                })

                console.error(error.response?.data?.message || 'Signup failed. Please try again.');
            }
        } else {
            try {
                const response = await axios.post(`${process.env.REACT_APP_URL}/auth/login`, authData);
                localStorage.setItem('userToken', response.data.token);
                localStorage.setItem('userRole', 'employee');
                localStorage.setItem('loggedInEmail', authData.email);
                localStorage.setItem('team_id', response.data.team_id);
                localStorage.setItem('userName', response.data.name);
                navigate('/employee-dashboard');
                notification.success({
                    message:"Login SuccessFully",
                    discription:'Welcome to Employee Pannel'
                })
            } catch (error) {
                notification.error({
                    message: 'Error',
                    description: error.response?.data?.message || 'Login failed. Please try again.',
                })
                console.error(error.response?.data?.message || 'Login failed. Please try again.');
            }
        }
    };

    return (
        <div className="employee-auth">
            <form onSubmit={handleAuth}>
                <h2>{isSignup ? 'Employee Signup' : 'Employee Login'}</h2>
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
            <style >{`
                .employee-auth {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f4f4f4;
                }

                form {
                    background-color: white;
                    padding: 30px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    width: 400px;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                h2 {
                    text-align: center;
                    font-size: 24px;
                    color: #333;
                }

                input {
                    padding: 10px;
                    margin: 5px 0;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: 16px;
                    background-color:rgb(102, 104, 106);
                }

                button {
                    padding: 12px;
                    background-color: #007bff;
                    border: none;
                    border-radius: 4px;
                    color: white;
                    font-size: 16px;
                    cursor: pointer;
                }

                button:hover {
                    background-color: #0056b3;
                }

                p {
                    text-align: center;
                    color: #007bff;
                    cursor: pointer;
                }

                p:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
};

export default EmployeeAuth;