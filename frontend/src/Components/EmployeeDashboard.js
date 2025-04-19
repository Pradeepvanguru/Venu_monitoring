import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import navigation hook
import EmployeeSidebar from './EmployeeSidebar';
import { ProgressBar as BootstrapProgressBar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { notification } from 'antd';
import { FaTrash } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';


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
 
     const TaskName = ({ taskName }) => {
              const [showFull, setShowFull] = useState(false);
              const capitalize = (text) =>
                text
                  .split(' ')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
            
            
              const words = taskName.split(' ');
              const isLong = words.length > 8;
              const fullText = capitalize(taskName);
              const shortText = words.slice(0, 8).join(' ') + '... >';
              const short=capitalize(shortText)
            
              return (
                <h6  onClick={() => setShowFull(!showFull)} style={{ cursor: 'pointer', color: 'rgba(207, 207, 191, 0.96), rgba(179, 179, 98, 0.96)' }}>
                  <strong>Task:</strong> {isLong && !showFull ? short : fullText}
                </h6>
              );
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
      
          <div className="employee-dashboard__todo-list" style={{fontSize:'10px'}}>
            {tasks.length > 0 ? (
              <ul className="employee-dashboard__task-list">
                {tasks.map((task) => {
                  const progress = task.progress ?? 0;
                  const formattedStartDate = format(new Date(task.startDate), 'dd MMM yyyy');
                  const formattedEndDate = format(new Date(task.endDate), 'dd MMM yyyy');
      
                  return (
                    <ul
                      key={task._id}
                      className="employee-dashboard__task-item"
                     
                      
                    >
                      <div className="employee-dashboard__task-card">
                        <div className="employee-dashboard__task-details">
                        <div className="employee-dashboard__task-edit">
                        <button
                            className="btn btn-outline-secondary "
                            onClick={() => handleTaskClick(task.moduleId)} style={{color:'#ff9133'}}
                          >
                          Click to Open 
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            disabled={progress !== 100}
                            
                            className="Delete btn btn-outline-secondary"
                          >
                            <FaTrash />
                          </button>
                         
                        </div>
                        <h3 className="employee-dashboard__task-name">
                        <TaskName taskName={task.taskName} />
                      </h3>

                          <p><strong>Module ID:</strong> {task.moduleId}</p>
                          <p><strong>Your Email:</strong> {task.assignEmail}</p>
                          <p><strong>Start Date:</strong> {formattedStartDate}</p>
                          <p><strong>Deadline:</strong> {formattedEndDate}</p>
                        </div>
                        <div className="employee-dashboard__task-progress">
                          <p><b>Task Progress:</b></p>
                          <BootstrapProgressBar now={progress} label={`${Math.round(progress)}%`} />
                        </div>
                       
                      </div>
                    </ul>
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
        <Tooltip anchorSelect='.delete' place='left'>complete all tasks</Tooltip>
      <style>
        {
          `/* Main dashboard layout */
.employee-dashboard {
    display: flex;
    background-color: #ffffff;
    padding: 10px;
    color: #ffffff;
    width: 100%;
    position: relative;
    height: 100vh;
    font-size: 10px;
}

/* Content area */
.employee-dashboard__content-wrapper {
    margin-left: 280px;
    padding: 20px;
    width: calc(100% - 280px);
    background-color: #2a2e35;
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    overflow-y: auto;
}
.employee-dashboard__content-wrapper::-webkit-scrollbar {
    display: none;
}

/* Refresh Button */
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
    border: none;
}
.employee-dashboard__refresh-btn:hover {
    background-color: #423ce575;
}

/* Heading */
.employee-dashboard__module-heading {
    color: #eaeaea;
    border-bottom: 3px solid #ff6347;
    padding-bottom: 10px;
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 30px;
    
}

/* Task list wrapper */
.employee-dashboard__todo-list {
    padding: 20px;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

/* Task item as card */
.employee-dashboard__task-item {
    background-color: #3a3e45;
    border-radius: 10px;
    width: 100%;
    max-width: 820px;
    min-width: 780px;
    flex: 1 1 auto;
    box-shadow: 0 3px 6px rgba(233, 250, 2, 0.25);
    transition: transform 0.3s ease, background-color 0.3s ease;
    list-style: none;
    padding: 15px;
    margin-bottom:20px;
   
}
.employee-dashboard__task-item:hover {
    background-color: #4c2f52;
    transform: scale(1.02);
}

/* Card content */
.employee-dashboard__task-card {
   margin-bottom:10px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
}

/* Task details */
.employee-dashboard__task-details {
    color: #f2f0ee;
    font-size: 0.75rem;
    font-weight: bold;
}
.employee-dashboard__task-name {
    color: #ffdf5d;
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 8px;
}
.employee-dashboard__task-details p {
    margin: 2px 0;
}

/* Progress section */
.employee-dashboard__task-progress p {
    color: white;
    font-weight: bold;
    margin-bottom: 5px;
}

.employee-dashboard__task-edit {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
}
\end{code}

/* Open button */
.employee-dashboard__task-action {
    display: flex;
    justify-content: space-between;
}

/* Disable button styling */
button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

/* No task fallback */
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
