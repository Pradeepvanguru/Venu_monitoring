import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faCheck, faCamera, faArrowLeft, faTrash, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Button, notification } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [preview, setPreview] = useState('');
    const [showUpdateFields, setShowUpdateFields] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [user, setUser] = useState({ name: "", email: "", profilePhoto: "" });
    const [oldUser, setOldUser] = useState(user);
    const navigate = useNavigate();
    const token = localStorage.getItem('userToken');


    // console.log("id",user.id)



    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        
        }
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_URL}/auth/api/profile`, {
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                setUser(response.data);
                setOldUser(response.data);
                setPreview(response.data.profilePhoto);
            } catch (error) {
                notification.error({ message: 'Failed to load profile.' });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [token, navigate]);

    const handleDeleteAccount = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_URL}/auth/api/deleteAccount`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            notification.success({ message: "Account deleted successfully" });
            localStorage.clear();
            navigate('/');
        } catch (error) {
            notification.error({ message: "Failed to delete account" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updatedData = {};
        if (user.name !== oldUser.name) updatedData.name = user.name;
        if (user.email !== oldUser.email) updatedData.email = user.email;
        if(user.team_id !==oldUser.team_id) updatedData.team_id=user.team_id;
        if (user.profilePhoto !== oldUser.profilePhoto) updatedData.profilePhoto = user.profilePhoto;
        if (Object.keys(updatedData).length === 0) {
            notification.info({ message: "No Changes are occure,Profile saved" });
            setShowUpdateFields(false)
            return;
            
        }
        
       
        try {
            await axios.put(`${process.env.REACT_APP_URL}/auth/api/updateProfile`, updatedData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
            });
            setOldUser({ ...oldUser, ...updatedData });

             // ✅ Update specific localStorage values
        if (updatedData.email) localStorage.setItem("loggedInEmail", updatedData.email);
        if (updatedData.team_id) localStorage.setItem("team_id", updatedData.team_id);
        if (updatedData.name) localStorage.setItem("userName", updatedData.name);
        if (updatedData.role) localStorage.setItem("userRole", updatedData.role);
        if (token) localStorage.setItem("userToken", token);
        
        notification.success({ message: "Profile updated successfully!" });
        setShowUpdateFields(false)
            
        } catch (error) {
            notification.error({ message: "Error updating profile." });
           
        }
    };
   
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${process.env.REACT_APP_URL}/auth/api/updatePassword`, {
                oldPassword, newPassword
            }, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            notification.success({ message: "Password updated successfully!" });
            setOldPassword("");
            setNewPassword("");
            setShowPasswordFields(false)
            
        } catch (error) {
            notification.error({ message:"faild to update!..please check your credentials"  });
            
            
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUser({ ...user, profilePhoto: file }); // Store file, not Base64
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result); // For preview only
            reader.readAsDataURL(file);
        }
    };

    if (loading) return <p>Loading...</p>;

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };


    return (
        <div className="profile-container">
            <button onClick={() => window.history.back()} className="back-button">
                <FontAwesomeIcon icon={faArrowLeft} /> Back
            </button>
           
            <h2 className="title">Profile</h2>
            <div className="profile-details">
                <div className="profile-image-container">
                    <img src={preview}  alt="Profile" className="profile-image" />
                    {showUpdateFields && (
                        <label className="image-upload-label">
                            <FontAwesomeIcon icon={faCamera} />
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>
                    )}
                </div>
                <p><strong>Team_id:</strong> {user.team_id}</p>
                <p><strong>Role:</strong> {user.role.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</p>
                <p><strong>Name:</strong> {user.name.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</p>
                <p><strong>Email:</strong> {user.email}</p>
               
             
            <button className="update-profile" onClick={() => setShowUpdateFields(!showUpdateFields)}>
                <FontAwesomeIcon icon={faPen} /> 
            </button>
            <button className="password-button" onClick={() => setShowPasswordFields(!showPasswordFields)}>
                <FontAwesomeIcon icon={faLock} />
            </button>
            <button className="delete-button" onClick={handleDeleteAccount}>
                <FontAwesomeIcon icon={faTrash} /> 

            </button>
           
            </div>
           
            {showUpdateFields && (
                <form className="profile-form" onSubmit={handleSubmit}>
                     <center><p>Update Here..!</p></center>
                    <input type="text" value={user.team_id} onChange={(e) => setUser({ ...user, team_id: e.target.value })} />
                    <input type="text" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                    <input type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} /><br></br>
                   <div className='d-flex  w-100 p-2' style={{flexDirection:'row'}}>
                   <button type="submit" className="update-button"><FontAwesomeIcon icon={faCheck}  /> Save</button> 
                   <button type="submit" className="cancel-button"  onClick={() => {setShowUpdateFields(false); }}>❌Cancel</button>
                   </div>
                </form>
            )}
            
            {showPasswordFields && (
                <form className="password-form" onSubmit={handlePasswordChange}>
                <center><p>Change Password Here..!</p></center>
                <div className="password-input">
                <input
                    type={showPassword ? "text" : "password"}
                    value={oldPassword}
                    placeholder="Old Password"
                    onChange={(e) => setOldPassword(e.target.value)}
                />
                <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    onClick={togglePasswordVisibility}
                    className="password-toggle-icon"
                />
            </div>

            <div className="password-input">
                <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    placeholder="New Password"
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    onClick={togglePasswordVisibility}
                    className="password-toggle-icon"
                />
               </div>
                    <div  className='d-flex  w-100 p-2' style={{flexDirection:"row"}}>
                    <button  type="submit" className="update-button"><FontAwesomeIcon icon={faCheck} />Reset</button>
                    <button type="submit" className="cancel-button"  onClick={() => {setShowPasswordFields(false); }}>❌Cancel</button>
                    </div>
                </form>
            )}
          
            <Tooltip anchorSelect={'.password-button'} place='top'>Reset Password</Tooltip>
            <Tooltip anchorSelect={'.delete-button'} place='top'>delete my account</Tooltip>
            <Tooltip anchorSelect={'.update-profile'} place='top'>update my profile</Tooltip>
            <Tooltip anchorSelect={'.image-upload-label'} place='top'>Upload New Profile Picture</Tooltip>
            <style>
                {
                    `
                   .profile-container {
                    max-width: 800px;
                    margin: auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    background-color: #fff;
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

                .title {
                    font-size: 24px;
                    margin-bottom: 20px;
                    color: #333;
                }

                .profile-image-container {
                    position: relative;
                    display: inline-block;
                    margin-bottom: 20px;
                    padding: 0px 10px;
                }

                .profile-image {
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    border: 3px solid #007bff;
                    object-fit: cover;
                }

                .image-upload-label {
                    position: absolute;
                    bottom: 0;
                    margin-right:10px;
                    right: 10px;
                    background: #007bff;
                    color: white;
                    padding: 8px;
                    border-radius: 50%;
                    cursor: pointer;
                }

                .profile-details {
                    text-align: left;
                    margin-bottom: 20px;
                    padding: 10px;
                    background: rgba(163, 159, 159, 0.46);
                    border-radius: 5px;
                }

                .profile-details p {
                    margin: 5px 0;
                    font-size: 14px;
                    padding: 0px 15px;
                }

                .profile-details strong {
                    color: #333;
                    font-size:14px;
                }

                .update-profile,
                .password-button,
                .delete-button {
                    width: 30%;
                    padding: 10px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    margin-top: 10px;
                    margin-bottom: 10px;
                    color: #fff;
                }

                .update-profile {
                    margin:10px;
                    background: #28a745;
                }

                .password-button {
                    margin:10px;
                    background: rgba(120, 146, 4, 0.76);
                }

                .delete-button {
                    background-color: rgba(243, 46, 7, 0.56);
                }

                .delete-button:hover {
                   background-color: rgba(243, 46, 7, 0.99);
                }

                .update-profile:hover {
                    background: rgba(42, 143, 59, 0.51);
                }

                .profile-form,
                .password-form {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 60%;
                    margin: 10px auto;
                    padding: 20px;
                    background: rgba(63, 63, 63, 0.19);
                    border-radius: 0 0 1rem 1rem;
                    box-shadow: 0 0 5px rgba(176, 181, 186, 0.99);
                    margin-top:-10px;
                }

                .profile-form input,
                .password-form input{
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 10px;
                    font-weight: bold;
                    color: #fff;
                    background-color: rgb(102, 104, 106);
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }

                .update-button,
                .cancel-button {
                    width: 30%;
                    padding:10px 19px 9px 9px;
                    margin-top:5px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 13px;
                    color: #fff;
                   
                }

                .update-button {
                    margin:5px;
                    margin-left:68px;
                    background: rgba(38, 141, 55, 0.72);
                }

                .update-button:hover {
                    background: rgba(42, 143, 59, 0.51);
                }

                .cancel-button {
                    margin:5px;
                    background: rgba(46, 46, 43, 0.44);
                }

                .cancel-button:hover {
                    background: rgba(243, 46, 7, 0.47);
                }


              .password-form .password-toggle-icon {
                position: relative;
                right: -90px;
                cursor: pointer;
                color: #fff;
                font-size: 12px;
                top: -40px;
              
                }

                `
                }
            </style>
        </div>
    );
};

export default ProfilePage;



{/* <style>
{
    `.profile-container {
max-width: 600px;
margin: auto;
padding: 20px;
border: 1px solid #ddd;
border-radius: 10px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
text-align: center;
background-color: #fff;
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

.title {
font-size: 24px;
margin-bottom: 20px;
color: #333;
}

.profile-image-container {
position: relative;
display: inline-block;
margin-bottom: 20px;
}

.profile-image {
width: 120px;
height: 120px;
border-radius: 50%;
border: 3px solid #007bff;
}

.image-upload-label {
position: absolute;
bottom: 0;
right: 0;
background: #007bff;
color: white;
padding: 5px;
border-radius: 50%;
cursor: pointer;
}

.profile-details {
text-align: left;
margin-bottom: 20px;
padding: 10px;
background: #f9f9f9;
border-radius: 5px;
}

.profile-details p {
margin: 5px 0;
font-size: 16px;
}

.profile-details strong {
color: #333;
}

.update-button, .password-toggle, .delete-button {
width: 100%;
padding: 10px;
border: none;
border-radius: 5px;
cursor: pointer;
font-size: 16px;
margin-top: 10px;
}

.update-button {
background: #28a745;
color: white;
}

.update-button:hover {
background: #218838;
}

.password-toggle {
background: #ffc107;
color: white;
}

.password-toggle:hover {
background: #e0a800;
}

.delete-button {
background: #dc3545;
color: white;
}

.delete-button:hover {
background: #c82333;
}

.password-fields {
margin-top: 10px;
}

.password-fields input {
width: 100%;
padding: 8px;
border: 1px solid #ddd;
border-radius: 5px;
margin-top: 5px;
}

.input-group {
display: flex;
flex-direction: column;
gap: 15px;
text-align: left;
}

.input-group label {
font-weight: bold;
font-size: 14px;
}

.input-group input {
width: 100%;
padding: 12px;
font-size: 16px;
border: 1px solid #ccc;
border-radius: 5px;
transition: border 0.3s ease-in-out;
}

.input-group input:focus {
border-color: #007bff;
outline: none;
box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}
`
}
</style> */}