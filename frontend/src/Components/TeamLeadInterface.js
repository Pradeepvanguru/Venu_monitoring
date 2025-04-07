import React, { useState, useEffect,navigate } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ProgressBar as BootstrapProgressBar } from 'react-bootstrap';
import Sidebar from './Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TeamLeadInterface.css';
import { notification } from 'antd';
import { useNavigate } from 'react-router-dom';


const TeamLeadInterface = () => {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const navigate=useNavigate()
    const token = localStorage.getItem('userToken'); // Retrieve token from localStorage

     useEffect(() => {
            const token = localStorage.getItem("userToken");
    
            if (!token) {
                notification.warning({ message: "Session expired!" ,
                    description: "You are not logged in. Please log in to continue." ,
                });
                navigate("/");
            }
        }, []);

    // Function to fetch tasks from the API
    const fetchTasks = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_URL}/api/tasks`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch tasks");
            }

            const fetchedTasks = await response.json();
            const updatedTasks = await Promise.all(
                fetchedTasks.map(async (task) => {
                    try {
                        const totalDays = Math.ceil(
                            (new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24)
                        );

                        const countRes = await axios.get(`${process.env.REACT_APP_URL}/api/data/${task.moduleId}/count`);
                        const submissionsCount = countRes.data.count;

                        // Calculate progress percentage
                        const calculatedProgress = (submissionsCount / totalDays) * 100 || 0;
                        return { ...task, progress: Math.min(calculatedProgress, 100) };
                    } catch (error) {
                        console.error(`Error fetching submission count for ${task.moduleId}:`, error);
                        return task;
                    }
                })
            );

            setTasks(updatedTasks);
        } catch (err) {
            console.error('Error fetching tasks:', err.response ? err.response.data : err.message);
            setError('Error fetching tasks');
        }
    };

    const handleDelete = async (taskId) => {
        if (!token) {
            setError('Unauthorized request: No token found.');
            console.error('Unauthorized request: No token found.');
            return;
        }
        try {
            const response = await axios.delete(`${process.env.REACT_APP_URL}/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response.data.message); // Log success message
            setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
        } catch (error) {
            console.error(`Error deleting task ${taskId}:`, error.response?.data || error.message);
            setError('Error deleting task');
        }
    };

    // Fetch tasks on component mount
    useEffect(() => {
        fetchTasks();
    }, []);
   
    const handleRefresh = () => {
        fetchTasks();
    };

    return (
        <div className="team-lead-interface">
            <Sidebar />
            <div className="content-wrapper">
            <button onClick={handleRefresh} className="btn btn-success refresh-btn">
                    Refresh 🔃
                </button>
                <h2 className="module-heading">Task Modules</h2>
               
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="todo-list">
                    {tasks.length > 0 ? (
                        <ul className="list-group">
                            {tasks.map((task) => {
                                const progress = task.progress ?? 0;
                                const formattedStartDate = format(new Date(task.startDate), 'dd MMM yyyy');
                                const formattedEndDate = format(new Date(task.endDate), 'dd MMM yyyy');
                                return (
                                    <li key={task._id} className="list-group-item task-item">
                                        <div className="task-card">
                                            <div className="task-details">
                                                <h3 className="task-name">{task.taskName}</h3>
                                                <p className="task-module-id"><strong>Module ID:</strong> {task.moduleId}</p>
                                                <p className="task-date"><strong>Assigned to:</strong> {task.assignEmail}</p>
                                                <p className="task-date"><strong>Start Date:</strong> {formattedStartDate}</p>
                                                <p className="task-date"><strong>Deadline:</strong> {formattedEndDate}</p>
                                            </div>
                                            <div className="task-progress">
                                                <p><b>Task Progress:</b></p>
                                                <BootstrapProgressBar now={progress} label={`${Math.round(progress)}%`} />
                                            </div>
                                            <div className='delete'>
                                                <button  
                                                    onClick={() => handleDelete(task._id)}
                                                    disabled={progress !== 100} // Disable button if progress is not 100%
                                                    className="btn btn-danger">
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="no-tasks">No tasks available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamLeadInterface;



