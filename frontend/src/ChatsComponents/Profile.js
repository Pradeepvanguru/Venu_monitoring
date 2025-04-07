import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faCheck, faCamera, faArrowLeft, faTrash, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Button, notification } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EmployeeDashboard from '../Components/EmployeeDashboard';
import EmployeeSidebar from '../Components/EmployeeSidebar';
import Sidebar from '../Components/Sidebar';



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

const capitalizeWords = (str) =>
  str?.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

const role=localStorage.getItem("userRole")

    return (
        <div className="profile-container">
        {role==='employee' ? <EmployeeSidebar />: <Sidebar />}
  <button onClick={() => window.history.back()} className="back-button">
    <FontAwesomeIcon icon={faArrowLeft} /> Back
  </button>

  <h2 className="title">Profile</h2>

  <div className="profile-details">
    <div className="profile-image-container">
      <img src={preview} alt="Profile" className="profile-image" />
      {showUpdateFields && (
        <label className="image-upload-label">
          <FontAwesomeIcon icon={faCamera} />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>
      )}
    </div>

    <p><strong>Team ID:</strong> {user.team_id}</p>
    <p><strong>Role:</strong> {capitalizeWords(user.role)}</p>
    <p><strong>Name:</strong> {capitalizeWords(user.name)}</p>
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

 <div className='d-flex mx-4 col-sm-11' style={{flexDirection:'row',gap:"12px",marginTop:'-26px'}}>
        
  {showUpdateFields && (
    <form className="profile-form" onSubmit={handleSubmit}>
      <center><p>Update Here..!</p></center>
      <input
        type="text"
        value={user.team_id}
        onChange={(e) => setUser({ ...user, team_id: e.target.value })}
      />
      <input
        type="text"
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
      />
      <input
        type="email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
      />
      <div className="d-flex w-100 p-2" style={{ flexDirection: 'row' }}>
        <button type="submit" className="update-button">
          <FontAwesomeIcon icon={faCheck} /> Save
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={() => setShowUpdateFields(false)}
        >
          ❌ Cancel
        </button>
      </div>
    </form>
  )}

  {showPasswordFields && (
    <form className="password-form" onSubmit={handlePasswordChange}>
      <center><p>Change Password Here..!</p></center>

      <div className="password-input">
        <input
          type={showPassword ? 'text' : 'password'}
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
          type={showPassword ? 'text' : 'password'}
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

      <div className="d-flex w-100 p-2" style={{ flexDirection: 'row' }}>
        <button type="submit" className="update-button">
          <FontAwesomeIcon icon={faCheck} /> Reset
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={() => setShowPasswordFields(false)}
        >
          ❌ Cancel
        </button>
      </div>
    </form>
  )}
    </div>

  {/* Tooltips */}
  <Tooltip anchorSelect=".password-button" place="top">Reset Password</Tooltip>
  <Tooltip anchorSelect=".delete-button" place="top">Delete my account</Tooltip>
  <Tooltip anchorSelect=".update-profile" place="top">Update my profile</Tooltip>
  <Tooltip anchorSelect=".image-upload-label" place="top">Upload New Profile Picture</Tooltip>


  <style>
    {
        `.profile-container {
  max-width: 75%;
  margin-left:280px ;
  padding:20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  background-color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  height: 100vh;
  overflow-y: auto;
  position: relative;
  
}

.profile-container::-webkit-scrollbar{
display:none;}

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
  font-size: 26px;
  margin-bottom: 20px;
  color: #333;
  font-weight: bold;
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
  right: 10px;
  background: #007bff;
  color: white;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s ease;
}

.image-upload-label:hover {
  background: #0056b3;
}

.profile-details {
  text-align: left;
  margin-bottom: 20px;
  padding: 10px;
  background: rgba(163, 159, 159, 0.1);
  border-radius: 8px;
}

.profile-details p {
  margin: 8px 0;
  font-size: 15px;
  padding: 0px 15px;
}

.profile-details strong {
  color: #333;
  font-size: 15px;
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
  margin: 10px;
  color: #fff;
  transition: all 0.3s ease-in-out;
}

.update-profile {
  background: #28a745;
}

.update-profile:hover {
  background: #218838;
}

.password-button {
  background: rgba(120, 146, 4, 0.76);
}

.password-button:hover {
  background: rgba(100, 125, 4, 0.9);
}

.delete-button {
  background-color: rgba(243, 46, 7, 0.56);
}

.delete-button:hover {
  background-color: rgba(243, 46, 7, 0.9);
}

.profile-form,
.password-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60%;
  margin: 20px auto 10px;
  padding: 20px;
  background: rgba(63, 63, 63, 0.1);
  border-radius: 0 0 1rem 1rem;
  box-shadow: 0 0 5px rgba(176, 181, 186, 0.99);
}

.profile-form input,
.password-form input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  font-weight: bold;
  color: #fff;
  background-color: rgba(102, 104, 106, 0.64);
  border: 1px solid #ccc;
  border-radius: 5px;
}

.update-button,
.cancel-button {
  width: 45%;
  padding: 10px;
  margin: 5px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  color: #fff;
  transition: all 0.3s ease;
}

.update-button {
  background: rgba(38, 141, 55, 0.72);
}

.update-button:hover {
  background: rgba(42, 143, 59, 0.6);
}

.cancel-button {
  background: rgba(46, 46, 43, 0.44);
}

.cancel-button:hover {
  background: rgba(243, 46, 7, 0.47);
}

.password-form .password-input {
  width: 100%;
  position: relative;
}

.password-toggle-icon {
  position: absolute;
  right: 15px;
  top: 35%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #fff;
  font-size: 14px;
}

@media screen and (max-width: 600px) {
  .profile-form, .password-form {
    width: 90%;
  }

  .update-profile,
  .password-button,
  .delete-button,
  .update-button,
  .cancel-button {
    width: 100%;
  }
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