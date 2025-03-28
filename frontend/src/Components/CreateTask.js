import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTask.css';
import axios from 'axios';
import EmployeeSidebar from './EmployeeSidebar';
import Sidebar from './Sidebar';
import {notification} from 'antd';


const CreateTask = () => {
    const [teamLead, setTeamLead] = useState('');
    const [taskName, setTaskName] = useState('');
    const [assignEmail, setAssignEmail] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [taskFile, setTaskFile] = useState(null);
    const [moduleId, setModuleId] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setTaskFile(e.target.files[0]);
    };

    

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('taskName', taskName);
        formData.append('assignEmail', assignEmail);
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('moduleId', moduleId);
        if (taskFile) {
            formData.append('taskFile', taskFile);
        }
    
        try {
            const token = localStorage.getItem('userToken'); // Ensure token exists
            console.log('Sending token:', token); // Debugging log
    
            const response = await axios.post('http://localhost:5000/api/tasks', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });
            notification.success({message:"Task created successfully"});
            // console.log('Response:', response);
            navigate("/Team-lead-interface")
           
        } catch (error) {
            console.error('Error creating task:', error.response ? error.response.data : error.message);
        }
    };
    
    

    return (
        <div className="create-task-container">
        <div>
            <Sidebar />
        </div>
            <h2>Create Task</h2>
            <form onSubmit={handleSubmit}>
                
                <input
                    type="text"
                    placeholder="Employee Task Name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    required
                />

               
                <input
                    type="email"
                    placeholder="Assignd Email"
                    value={assignEmail}
                    onChange={(e) => setAssignEmail(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Module ID"
                    value={moduleId}
                    onChange={(e) => setModuleId(e.target.value)}
                    required
                />

                <label>Project Documents</label>
                <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    required
                />

                <label>Start Date</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                />

                <label>End Date</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                />

               <center>
               <div className="button-group  ">
                    <button type="button" className="back-btn m-4 bg-warning px-3" onClick={() => navigate(-1)}>cancil</button>
                    <button type="submit" className="submit-btn px-2 mt-4 my-4">Create Task</button>
                </div>
               </center>
            </form>
        </div>
    );
};

export default CreateTask;
