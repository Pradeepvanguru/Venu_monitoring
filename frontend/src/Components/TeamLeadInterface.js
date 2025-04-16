import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ProgressBar as BootstrapProgressBar } from 'react-bootstrap';
import Sidebar from './Sidebar';
import { notification, Dropdown, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaEllipsisV } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TeamLeadInterface.css';

const TeamLeadInterface = () => {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const [userDetails,setuserDetails]=useState()
    const navigate = useNavigate();
    const token = localStorage.getItem('userToken');

    useEffect(() => {
        if (!token) {
            notification.warning({
                message: "Session expired!",
                description: "You are not logged in. Please log in to continue."
            });
            navigate("/");
        }
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_URL}/api/tasks`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const fetchedTasks = await response.json();

            const updatedTasks = await Promise.all(fetchedTasks.map(async (task) => {
                try {
                    const totalDays = Math.ceil(
                        (new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24)
                    );
                    const countRes = await axios.get(`${process.env.REACT_APP_URL}/api/data/${task.moduleId}/count`);
                    const submissionsCount = countRes.data.count;
                    // console.log("count:",submissionsCount)
                    setuserDetails(countRes.data.userName.name)
                    const calculatedProgress = (submissionsCount / totalDays) * 100 || 0;
                    return { ...task, progress: Math.min(calculatedProgress, 100) };
                } catch (error) {
                    console.error(`Error fetching submission count for ${task.moduleId}:`, error);
                    return task;
                }
            }));

            setTasks(updatedTasks);
            setFilteredTasks(updatedTasks);
        } catch (err) {
            console.error('Error fetching tasks:', err.response ? err.response.data : err.message);
            setError('Error fetching tasks');
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        const filtered = tasks.filter(task => task.taskName.toLowerCase().includes(value.toLowerCase()));
        setFilteredTasks(filtered);
    };

    const handleDelete = async (taskId) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_URL}/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks(prev => prev.filter(task => task._id !== taskId));
            setFilteredTasks(prev => prev.filter(task => task._id !== taskId));
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleClickCard = (task) => {
        localStorage.setItem('selectedTask',JSON.stringify(task));
        navigate('/file-modules'); // redirect
    };

    const handleToggleExpand = (id) => {
        setExpandedTaskId(prev => (prev === id ? null : id));
    };

    const menuItems = (task) => (
        [
            // {
            //   key: 'edit',
            //   label: <span onClick={() => console.log("Edit", task._id)}>Edit</span>
            // },
            {
              key: 'delete',
              label: <span onClick={() => handleDelete(task._id)}>Delete</span>
            }
          ]
    );
    const handleRefresh = () => {
        fetchTasks();
    };

    return (
        <div className="team-lead-interface">
            <Sidebar />
            <div className="content-wrapper">
            <h2 className="module-heading">Tasks</h2>
            <button onClick={handleRefresh} className="btn btn-success refresh-btn mt-0">
                    Refresh 🔃
                </button>
                <div>
                <input
                    type="text"
                    className="form-control mb-2 w-50 bg-secondary"
                    placeholder="Search by task name..."
                    value={searchTerm}
                    onChange={handleSearch}
                    
                />
                <i
                     className="fa fa-search"
                    style={{
                        position: "absolute",
                        right: "500px",
                        top: "110px",
                        transform: "translateY(-50%)",
                        fontSize: "20px",
                        color: "#fffff",
                        cursor: "pointer",
                        transition: "0.3s ease-in-out",
                    }}
                    ></i>

                {error && <div className="alert alert-danger">{error}</div>}
                </div>
                <ul className="list-group">
                    {filteredTasks.map(task => {
                        const progress = task.progress ?? 0;
                        const start = format(new Date(task.startDate), 'dd MMM yyyy');
                        const end = format(new Date(task.endDate), 'dd MMM yyyy');
                        const isExpanded = expandedTaskId === task._id;

                        return (
                            <li
                                key={task._id}
                                className="list-group-item task-card"
                            >
                                <div className="d-flex justify-content-between align-items-start py-4 ">
                    
                                    <div className="task-info">
                                    <button className='btn btn-outline-primary text-dark'    onClick={() => handleClickCard(task)}  style={{float:'right',padding:'5px',margin:'30px'}}>Check Daily Work</button>
                                    <center className='fs-6'> <p><strong>Task:</strong> {task.taskName}</p></center>
                                        <div className="d-flex align-items-center mx-2">
                                            <span className="task-dates" >
                                           <strong className='text-secondary'> <h6>Name: {userDetails}</h6></strong>
                                           
                                                {start} → {end}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '10px', marginTop: '5px',width:'75%',border:'1px solid rgba(7, 45, 142, 0.93)' ,borderRadius:'1rem'}}>
                                            <BootstrapProgressBar
                                                now={progress}
                                                label={`${Math.round(progress)}%`}
                                                style={{ height: '10px' }}
                                            />
                                        </div>
                                    </div>
                                    <Dropdown menu={{ items: menuItems(task) }} trigger={['click']}>
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <FaEllipsisV className="dots-icon" />
                                    </div>
                                    </Dropdown>
                                    <FaChevronDown
                                                className="toggle-arrow"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleExpand(task._id);
                                                }}
                                                style={{float:'right',marginTop:'70px'}}
                                            />
                                            

                                </div>
                                {isExpanded && (
                                    <div className="extra-details mt-2" style={{ fontSize: '10px' }}>
                                        <p><strong>Module:</strong> {task.moduleId}</p>
                                        <p><strong>Assigned To:</strong> {task.assignEmail}</p>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default TeamLeadInterface;
