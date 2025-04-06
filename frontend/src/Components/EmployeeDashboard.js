import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import navigation hook
import EmployeeSidebar from './EmployeeSidebar';
import { ProgressBar as BootstrapProgressBar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './TeamLeadInterface.css';
import { notification } from 'antd';


const EmployeeDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Initialize navigation
    const token=localStorage.getItem('userToken')

     useEffect(() => {
            const token = localStorage.getItem("userToken");
    
            if (!token) {
                notification.warning({ message: "Session expired!" ,
                    description: "You are not logged in. Please log in to continue." ,
                });
                navigate("/");
            }
        }, []);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_URL}/api/task`, {
                headers: { "Content-Type": "application/json",'Authorization': `Bearer ${token}` }
               
            });
            const fetchedTasks = res.data;

            const updatedTasks = await Promise.all(
                fetchedTasks.map(async (task) => {
                    try {
                        const totalDays = Math.ceil(
                            (new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24)
                        );
                        const countRes = await axios.get(`${process.env.REACT_APP_URL}/api/data/${task.moduleId}/count`);
                        const submissionsCount = countRes.data.count;

                        const calculatedProgress = (submissionsCount / totalDays) * 100 || 0;

                        return {
                            ...task,
                            progress: Math.min(calculatedProgress, 100),
                        };
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

    // const handleRefresh = () => {
    //     fetchTasks();
    // };
    const handleDelete = async (taskId) => {
        try {
            // Make sure taskId is passed correctly in the URL
            const response = await axios.delete(`${process.env.REACT_APP_URL}/api/tasks/${taskId}`);
            console.log(response.data.message);  // Log success message for debugging
    
            // Remove the deleted task from the state
            setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
        } catch (error) {
            console.error(`Error deleting task ${taskId}:`, error.response ? error.response.data : error.message);
            setError('Error deleting task');
        }
    };
       
    // Function to navigate to TaskModules page when task is clicked
    const handleTaskClick = (moduleId) => {
        navigate(`/task-modules/${moduleId}`); // Redirects to TaskModules page
    };

    return (
        <div className="team-lead-interface">
            <EmployeeSidebar />
            <div className="content-wrapper">
                {/* <button onClick={handleRefresh} className="btn btn-success refresh-btn">
                    Refresh 
                </button> */}
                <h2 className="module-heading">Tasks</h2>

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
                                                <p className="task-date"><strong>Your Email:</strong> {task.assignEmail}</p>
                                                <p className="task-date"><strong>Start Date:</strong> {formattedStartDate}</p>
                                                <p className="task-date"><strong>Deadline:</strong> {formattedEndDate}</p>
                                            </div>
                                            <div className="task-progress">
                                                <p><b>Task Progress:</b></p>
                                                <BootstrapProgressBar now={progress || "0%"} label={`${Math.round(progress)}%`} />
                                            </div>
                                            <div className='delete'>
                                                <button  
                                                    onClick={() => handleDelete(task._id)}
                                                    disabled={progress !== 100} // Disable button if progress is not 100%
                                                    className="btn btn-danger">
                                                    Delete
                                                </button>
                                            </div>
                                            <div className="task-action">
                                                <button 
                                                    className="btn bg-warning text-dark " style={{float:"right",marginTop:"50px"}}
                                                    onClick={() => handleTaskClick(task.moduleId)}
                                                >
                                                    Open &gt;
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className=' rounded p-2 text-center'>
                            <p className="no-tasks">No tasks available</p>
                            <p>Overview of tasks, progress, and upcoming deadlines.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
