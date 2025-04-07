import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {  notification } from 'antd';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer } from 'react-toastify';

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
    const [fileName, setFileName] = useState('');
   

    const switchMode = () => {
        setIsSignup((prevIsSignup) => !prevIsSignup);
    };
    const handleFileChange = (e) => {
        const file=e.target.files[0];
        if (file) {
            setProfilePic(file);
            setFileName(file.name) // sets file name
          }
    };


    const handleAuth = async (e) => {
        e.preventDefault();
        const authData = { email, password, role: 'employee', teamId, name,profile };

        if (isSignup) {
            if (password !== confirmPassword) {
                notification.warning({
                    message: 'Password Error',
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
                notification.warning({
                    message: 'Signup Failed',
                    description: error.response?.data?.message,
                });
                
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
                notification.warning({
                    message: 'Error',
                    description: error.response?.data?.message,
                });
              
            }
        }
    };

    

    return (
        <div className="employee-auth">
            <form onSubmit={handleAuth} className="employee-auth__form">
                 <ToastContainer position="top-right" autoClose={3000} />
                     <button onClick={() => window.history.back()} className="back-button w-50">
                            <FontAwesomeIcon icon={faArrowLeft} /> Back
                            </button>
                  <center><h4>{isSignup ? 'Employee Signup' : 'Employee Login'}</h4></center>
                   {isSignup && (
                    <>
                        <input
                         className="employee-auth__input"
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
                            className="employee-auth__input"
                        />
                        <label>Profile Pic:</label>
                        <input  type="file" accept="image/*" onChange={handleFileChange} placeholder={fileName}/>
                       
                    </>
                )}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="employee-auth__input"
                />
                <div className="employee-auth__password-container">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password must be 6 or more characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="employee-auth__input"
                    />
                    
                    <span className="employee-auth__eye-icon" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                    
                </div>
                
                {isSignup && (
                    <div className="employee-auth__password-container ">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="employee-auth__input"
                        />
                        <span className="employee-auth__eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                )}
                <button className="employee-auth__button" type="submit">{isSignup ? 'Sign Up' : 'Login'}</button>
                <p onClick={switchMode}>
                    {isSignup ? 'Already have an account? Login' : 'Don’t have an account? Sign Up'}
                </p>
                <center><p><Link to='/forgot'>Forgot Password?</Link></p></center>
                
            </form>
            <style>{`
    .employee-auth {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f4f4f4;
        padding: 20px;
        width: 100%;
        height: 100vh;
        overflow-y: auto;
        position: relative;
        margin-top:5px;
    }

    .employee-auth__form {
        background-color: white;
        padding: 15px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.64);
        border-radius: 8px;
        width: 500px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .employee-auth__form h4 {
        text-align: center;
        font-size: 20px;
        color: #333;
    }
    .employee-auth__form label{
      font-size:14px;
      font-weight:200;
    }

    .employee-auth .back-button {
        background: white;
        border: none;
        color: #007bff;
        font-size: 16px;
        cursor: pointer;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
    }

    .employee-auth .back-button svg {
        margin-right: 5px;
    }

    .employee-auth__input {
        padding: 10px;
        margin: 5px 0;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        background-color: rgba(102, 104, 106, 0.55);
        width: 100%;
        color:rgb(22, 22, 22);
    }

    .employee-auth__password-container {
        position: relative;
        display: flex;
        align-items: center;
    }

    .employee-auth__password-container input {
        flex: 1;
        padding-right: 40px;
    }

    .employee-auth__eye-icon {
        position: absolute;
        right: 10px;
        cursor: pointer;
        color: #fff;
    }

    .employee-auth__button {
        padding: 12px;
        background-color: rgba(5, 200, 171, 0.8);
        border: none;
        border-radius: 4px;
        color: white;
        font-size: 14px;
        cursor: pointer;
    }

    .employee-auth__button:hover {
        background-color: rgba(5, 200, 171, 0.44);
    }

    .employee-auth__form p {
        text-align: center;
        color: #007bff;
        cursor: pointer;
        font-size:13px;
    }

    .employee-auth__form p:hover {
        text-decoration: underline;
    }

    .employee-auth__form input[type="file"] {
                    border: none;
                    padding: 10px;
                    background-color: rgba(84, 86, 87, 0.58);
                    color: white;
                    border-radius: 4px;
                }
`}</style>

        </div>
    );
};

export default EmployeeAuth;
