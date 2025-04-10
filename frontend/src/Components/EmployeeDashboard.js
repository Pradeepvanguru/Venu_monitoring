import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import navigation hook
import EmployeeSidebar from './EmployeeSidebar';
import { ProgressBar as BootstrapProgressBar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import axios from 'axios';
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

    const handleRefresh = () => {
        fetchTasks();
    };
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
        <div className="employee-dashboard">
        <EmployeeSidebar />
        <div className="employee-dashboard__content-wrapper">
          <button onClick={handleRefresh} className="btn boder-1 employee-dashboard__refresh-btn">
            Refresh 🔃
          </button>
          <h2 className="employee-dashboard__module-heading">Task Modules</h2>
      
          {error && <div className="alert alert-danger">{error}</div>}
      
          <div className="employee-dashboard__todo-list">
            {tasks.length > 0 ? (
              <ul className="employee-dashboard__task-list">
                {tasks.map((task) => {
                  const progress = task.progress ?? 0;
                  const formattedStartDate = format(new Date(task.startDate), 'dd MMM yyyy');
                  const formattedEndDate = format(new Date(task.endDate), 'dd MMM yyyy');
      
                  return (
                    <li
                      key={task._id}
                      className="employee-dashboard__task-item"
                      onClick={() => handleTaskClick(task.moduleId)}
                    >
                      <div className="employee-dashboard__task-card">
                        <div className="employee-dashboard__task-details">
                          <h3 className="employee-dashboard__task-name">{task.taskName}</h3>
                          <p><strong>Module ID:</strong> {task.moduleId}</p>
                          <p><strong>Your Email:</strong> {task.assignEmail}</p>
                          <p><strong>Start Date:</strong> {formattedStartDate}</p>
                          <p><strong>Deadline:</strong> {formattedEndDate}</p>
                        </div>
                        <div className="employee-dashboard__task-progress">
                          <p><b>Task Progress:</b></p>
                          <BootstrapProgressBar now={progress} label={`${Math.round(progress)}%`} />
                        </div>
                        <div className="employee-dashboard__task-delete">
                          <button
                            onClick={() => handleDelete(task._id)}
                            disabled={progress !== 100}
                            className="btn btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="employee-dashboard__task-action">
                          <button
                            className="btn bg-warning text-dark"
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
              <div className="employee-dashboard__no-tasks">
                <p>No tasks available</p>
                <p>Overview of tasks, progress, and upcoming deadlines.</p>
              </div>
            )}
          </div>
        </div>
      <style>
        {
          `/* Employee Dashboard container */
.employee-dashboard {
    display: flex;
    background-color: #ffffff;
    padding: 10px;
    color: #ffffff;
    width: 100%;
    position: relative;
    height: 100vh;
}

/* Content wrapper */
.employee-dashboard__content-wrapper {
    margin-left: 280px;
    padding: 20px;
    width: calc(100% - 280px);
    background-color: #2a2e35;
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    position: relative;
    overflow-y: auto;
}
.employee-dashboard__content-wrapper::-webkit-scrollbar {
    display: none;
}

/* Refresh button */
.employee-dashboard__refresh-btn {
    float: right;
    background-color: #1326cc5d;
    color: #fff;
    border-radius: 5px;
    padding: 6px 15px;
    margin-top: 47px;
    font-weight: 500;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.3s ease;
    border-bottom: 1px solid #fff;
}
.employee-dashboard__refresh-btn:hover {
    background-color: #423ce575;
}

/* Module heading */
.employee-dashboard__module-heading {
    color: #eaeaea;
    border-bottom: 3px solid #ff6347;
    padding-bottom: 10px;
    font-size: 1.6rem;
    font-weight: bold;
    margin-bottom: 30px;
}

/* Task list */
.employee-dashboard__todo-list {
    padding: 20px;
    width: 100%;
    border-radius: 12px;
}

/* Individual task item */
.employee-dashboard__task-item {
    background-color: #3a3e45;
    margin-bottom: 20px;
    border: none;
    border-radius: 10px;
    height: 270px;
    box-shadow: 0 3px 6px rgba(233, 250, 2, 0.25);
    transition: transform 0.3s ease, background-color 0.3s ease;
}
.employee-dashboard__task-item:hover {
    background-color: #4c2f52;
    transform: scale(1.02);
}

/* Task card */
.employee-dashboard__task-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
    border-radius: 10px;
}

/* Task progress */
.employee-dashboard__task-progress {
    margin-bottom: 20px;
    color: white;
}
.employee-dashboard__task-progress p {
    color: white;
}

/* Task details */
.employee-dashboard__task-details {
    flex: 1;
    padding-bottom: 20px;
}

/* Task name */
.employee-dashboard__task-name {
    color: #ffdf5d;
    font-weight: bold;
    margin-bottom: 8px;
    font-size: 1.5rem;
    margin-left: 350px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* Module ID and email/date styling */
.employee-dashboard__task-details p {
    color: #f2f0ee;
    font-weight: bold;
    margin-bottom: 8px;
    font-size: 1rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
.employee-dashboard__task-details strong {
    color: white;
}

/* Delete button container */
.employee-dashboard__task-delete {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 10px;
    margin-top: -260px;
}

/* Action button container (Open) */
.employee-dashboard__task-action {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
}

/* Disabled buttons */
button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

/* No tasks */
.employee-dashboard__no-tasks {
    text-align: center;
    font-size: 1.2rem;
    color: #aaaaaa;
    padding: 20px;
    margin-top: 40px;
    font-style: italic;
}
`
        }
      </style>
    
      </div>

      
    );
};

export default EmployeeDashboard;
