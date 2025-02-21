import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTask.css';
import axios from 'axios';
import EmployeeSidebar from './EmployeeSidebar';
import Sidebar from './Sidebar';

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
            const response = await axios.post(`${process.env.REACT_APP_URL}/api/tasks`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                navigate('/team-lead-interface');
            }
        } catch (error) {
            console.error('Error creating task:', error);
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
                    placeholder="Assign Email"
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
                    accept=".pdf,.doc,.docx,.txt"
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
