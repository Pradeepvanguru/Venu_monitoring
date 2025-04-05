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
             <button onClick={() => window.history.back()} className="back-button">
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
                   
                    
                    <label><>Profile Pic:</></label>
                    <input className='bg-secondary' type="file" accept="image/*" onChange={handleFileChange} placeholder={fileName}  />
                        
                    </>
                )}
                <button type="submit">{isSignup ? 'Sign Up' : 'Login'}</button>
                <center><Link to='/forgot'>Forgot Password?</Link></center>
                <p onClick={switchMode}>
                    {isSignup ? 'Already have an account? Login' : 'Don’t have an account? Sign Up'}
                </p>
               
                
                
            </form>
            

            <style>{`
                .team-lead-auth {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f4f4f4;
                    padding:20px;
                    width:100%;
                    margin:20px;
                    
                }
                form {
                    background-color: white;
                    padding:30px;
                    margin:10px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    width: 500px;
                    display: flex;
                    flex-direction: column;
                    gap:5px;
                }

                
                .back-button {
                background: none;
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

                .password-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .eye-icon {
                    position: absolute;
                    right: 10px;
                    cursor: pointer;
                    color: #888;
                }
                input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: 16px;
                    background-color: rgb(102, 104, 106);
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

export default TeamLeadAuth;
