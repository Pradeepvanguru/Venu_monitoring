import React, { useState } from 'react';
import {Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { notification } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons'


const TeamLeadAuth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
     const [profile,setProfilePic]=useState(null)
    const navigate = useNavigate();
    const [fileName,setFileName]=useState()

    const switchMode = () => {
        setIsSignup((prevIsSignup) => !prevIsSignup);
    };
    const handleFileChange = (e) => {
        const file=(e.target.files[0]);
        setFileName(file.name)
        setProfilePic(file)
       
    };
 
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        const authData = { email, password, role: 'team-lead', name, profile };
    
        if (isSignup) {
            if (password !== confirmPassword) {
                notification.warning({
                    message: 'Error',
                    description: 'Passwords do not match!',
                });
                return;
            }
            authData.name = name;
            try {
                const response = await axios.post(`${process.env.REACT_APP_URL}/auth/signup`, authData,{
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                notification.success({
                    message: 'Success',
                    description: response.data.message,
                });
                setIsSignup(false);
            } catch (error) {
                notification.warning({
                    message: 'Signup Failed',
                    description: error.response?.data?.message,
                });
            }
        } else {
            try {
                const response = await axios.post(`${process.env.REACT_APP_URL}/auth/login`, authData);
                localStorage.setItem('userToken', response.data.token);
                localStorage.setItem('userRole', 'team-lead');
                localStorage.setItem('loggedInEmail', authData.email);
                localStorage.setItem('team_id', response.data.team_id);
                localStorage.setItem('userName', response.data.name);
                navigate('/team-lead-interface');
                notification.success({
                    message: 'Login Successful',
                    description: 'Welcome back!',
                });
            } catch (error) {
                notification.error({
                    message: 'Login Failed',
                    description: error.response?.data?.message || 'Invalid email or password!',
                });
            }
        }
    };
    return (
        <div className="team-lead-auth">
        <form onSubmit={handleAuth}>
            <button onClick={() => window.history.back()} className="back-button bg-white w-50">
                <FontAwesomeIcon icon={faArrowLeft} /> Back
            </button>
            <center>
                <h4>{isSignup ? 'Team Lead Signup' : 'Team Lead Login'}</h4>
            </center>
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
            <div className="password-container">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password must be 6 or more characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {showPassword ? (
                    <EyeInvisibleOutlined onClick={togglePasswordVisibility} className="eye-icon text-white" />
                ) : (
                    <EyeOutlined onClick={togglePasswordVisibility} className="eye-icon text-white" />
                )}
            </div>
            {isSignup && (
                <>
                    <div className="password-container">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        {showConfirmPassword ? (
                            <EyeInvisibleOutlined onClick={toggleConfirmPasswordVisibility} className="eye-icon text-white" />
                        ) : (
                            <EyeOutlined onClick={toggleConfirmPasswordVisibility} className="eye-icon text-white" />
                        )}
                    </div>
    
                    <label>Profile Pic:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        placeholder={fileName}
                    />
                </>
            )}
            <button type="submit">{isSignup ? 'Sign Up' : 'Login'}</button>
            <center><p><Link to='/forgot'>Forgot Password?</Link></p></center>
            <p onClick={switchMode}>
                {isSignup ? 'Already have an account? Login' : 'Don’t have an account? Sign Up'}
            </p>
    
            <style>{`
                .team-lead-auth {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f4f4f4;
                    padding: 20px;
                    width: 100%;
                    margin: 20px;
                }
    
                .team-lead-auth form {
                    background-color: white;
                    padding: 30px;
                    margin: 10px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    width: 500px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
    
                .team-lead-auth .back-button {
                    background-color: white;
                    border: none;
                    color: #007bff;
                    font-size: 16px;
                    cursor: pointer;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                }
    
                .team-lead-auth .back-button svg {
                    margin-right: 5px;
                }
    
                .team-lead-auth .password-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
    
                .team-lead-auth .eye-icon {
                    position: absolute;
                    right: 10px;
                    cursor: pointer;
                    color: #888;
                }
    
                .team-lead-auth input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: 14px;
                    background-color: rgba(102, 104, 106, 0.5);
                    color: rgba(12, 12, 12, 0.98);
                }
    
                .team-lead-auth button[type="submit"] {
                    padding: 10px;
                    background-color:rgba(0, 123, 255, 0.71);
                    border: none;
                    border-radius: 4px;
                    color: white;
                    font-size: 16px;
                    cursor: pointer;
                }
                 .team-lead-auth button:hover{
                   background-color:rgba(6, 82, 162, 0.51);
                 }

                .team-lead-auth p {
                    text-align: center;
                    color:rgba(0, 123, 255, 0.69);
                    cursor: pointer;
                    font-size:12px;
                }
    
                .team-lead-auth p:hover {
                    text-decoration: underline;
                }
    
                .team-lead-auth label {
                    font-weight: 200;
                    margin-top: 5px;
                    font-size:14px;
                }
    
                .team-lead-auth input[type="file"] {
                    border: none;
                    padding: 10px;
                    background-color: rgba(102, 104, 106, 0.48);
                    color: white;
                    border-radius: 4px;
                }
    
                .team-lead-auth h4 {
                    margin-bottom: 10px;
                }
            `}</style>
        </form>
    </div>
    
    );
};

export default TeamLeadAuth;
