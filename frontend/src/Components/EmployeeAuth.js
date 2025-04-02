import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { message, notification } from 'antd';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const EmployeeAuth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [teamId, setTeamId] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profile,setProfilePic]=useState(null)
    const navigate = useNavigate();

    const switchMode = () => {
        setIsSignup((prevIsSignup) => !prevIsSignup);
    };
    const handleFileChange = (e) => {
        setProfilePic(e.target.files[0]);
    };


    const handleAuth = async (e) => {
        e.preventDefault();
        const authData = { email, password, role: 'employee', teamId, name,profile };

        if (isSignup) {
            if (password !== confirmPassword) {
                notification.error({
                    message: 'Error',
                    description: 'Passwords do not match!',
                });
                return;
            }
            authData.name = name;
            authData.teamId = teamId;

            try {
                const response = await axios.post(`${process.env.REACT_APP_URL}/auth/signup`, authData,{
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
                );
                notification.success({
                    message: 'Success',
                    description: response.data.message,
                });
                setIsSignup(false);
            } catch (error) {
                notification.error({
                    message: 'Signup Failed',
                    description: error.response?.data?.message || 'Signup failed. Please try again.',
                });
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
                    message: "Login Successfully",
                    description: 'Welcome to Employee Panel'
                });
            } catch (error) {
                notification.error({
                    message: 'Error',
                    description: error.response?.data?.message || 'Login failed. Please try again.',
                });
                console.error(error.response?.data?.message || 'Login failed. Please try again.');
            }
        }
    };

    

    return (
        <div className="employee-auth">
            <form onSubmit={handleAuth}>
              <button onClick={() => window.history.back()} className="back-button">
                            <FontAwesomeIcon icon={faArrowLeft} /> Back
                        </button>
                <center><h4>{isSignup ? 'Employee Signup' : 'Employee Login'}</h4></center>
                {isSignup && (
                    <>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Team ID"
                            value={teamId}
                            onChange={(e) => setTeamId(e.target.value)}
                            required
                        />
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                    </>
                )}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <div className="password-container text-white">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password must be 6 or more characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    
                    <span className="eye-icon text-white" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                    
                </div>
                
                {isSignup && (
                    <div className="password-container ">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <span className="eye-icon text-white" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                )}
                <button className='actions' type="submit">{isSignup ? 'Sign Up' : 'Login'}</button>
                <p onClick={switchMode}>
                    {isSignup ? 'Already have an account? Login' : 'Don’t have an account? Sign Up'}
                </p>
                <center><Link to='/forgot'>Forgot Password?</Link></center>
                
            </form>
            <style>{`
                .employee-auth {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f4f4f4;
                    padding:10px;
                    width:100%;
                }

                form {
                    background-color: white;
                    padding: 20px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    width: 400px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                h2 {
                    text-align: center;
                    font-size: 24px;
                    color: #333;
                }

                .back-button {
                background: white;
                border: none;
                color: #007bff;
                font-size: 16px;
                cursor: pointer;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                }

                .back-button svg {
                margin-right: 5px;
                }


                input {
                    padding: 10px;
                    margin: 5px 0;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: 16px;
                    background-color: rgb(102, 104, 106);
                    width: 100%;
                }

                .password-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .password-container input {
                    flex: 1;
                    padding-right: 40px;
                }

                .eye-icon {
                    position: absolute;
                    right: 10px;
                    cursor: pointer;
                    color: #666;
                }

                .actions {
                    padding: 12px;
                    background-color: rgba(5, 200, 171, 0.8);
                    border: none;
                    border-radius: 4px;
                    color: white;
                    font-size: 16px;
                    cursor: pointer;
                }

                .actions:hover {
                    background-color:rgba(5, 200, 171, 0.44);
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
