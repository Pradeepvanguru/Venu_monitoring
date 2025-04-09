import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTask.css';
import axios from 'axios';
import Sidebar from './Sidebar';
import { notification } from 'antd';

const CreateTask = () => {
    const [taskName, setTaskName] = useState('');
    const [assignEmail, setAssignEmail] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [taskFile, setTaskFile] = useState(null);
    const [moduleSummury, setModuleId] = useState('');
    const [fileName, setFileName] = useState('');
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const navigate = useNavigate();

    const token = localStorage.getItem('userToken');

    useEffect(() => {
        const teamId = localStorage.getItem('team_id');
        
        if (teamId) {
          const fetchTeamMembers = async () => {
            try {
              const response = await axios.get(`${process.env.REACT_APP_URL}/api/team-members/${teamId}`,{
                headers: {Authorization:`Bearer ${token}`}
              });
              setTeamMembers(response.data); // assuming response.data is an array of teammates
            } catch (error) {
              console.error('Error fetching team members:', error);
            }
          };
    
          fetchTeamMembers();
        }
      }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setTaskFile(file);
        }
    };

    const handleEmailSelect = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setAssignEmail(prev => [...prev, value]);
        } else {
            setAssignEmail(prev => prev.filter(email => email !== value));
            setSelectAll(false); // uncheck selectAll if one is unchecked
        }
    };

    const handleSelectAll = (e) => {
        const { checked } = e.target;
        setSelectAll(checked);
        if (checked) {
            const allEmails = teamMembers.map(member => member.email);
            setAssignEmail(allEmails);
        } else {
            setAssignEmail([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('taskName', taskName);
        formData.append('assignEmail', JSON.stringify(assignEmail)); // send as array
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('moduleSummury', moduleSummury);
        if (taskFile) {
            formData.append('taskFile', taskFile);
        }

        try {
           
            const response = await axios.post(`${process.env.REACT_APP_URL}/api/tasks`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });
            notification.success({ message: "Task created and sent successfully!" });
            navigate(-1);
        } catch (error) {
            console.error('Error creating task:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div  className="create-task-container ">
          <div className='rounded' style={{boxShadow: '0 8px 14px rgb(143, 140, 140)'}}>
            <div><Sidebar /></div>
           
            <form onSubmit={handleSubmit}>
            <h2 >Create Task Module</h2>
                <input type="text" placeholder="Task Module Name " value={taskName} onChange={(e) => setTaskName(e.target.value)} required />
                
                <label>Start Date</label>
                <input type="date"  className='w-100' value={startDate} onChange={(e) => setStartDate(e.target.value)} required />

                <label>End Date</label>
                <input type="date" className='w-100' value={endDate} onChange={(e) => setEndDate(e.target.value)} required />

                <label>Project Documents</label>
                <input className='bg-secondary rounded' type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" onChange={handleFileChange} required placeholder={fileName} />


                {/* Team member dropdown with checkboxes */}
                <label>Teammates</label>
                <div className="team-checkbox-container ">
                {/* Select All */}
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    id="selectAllCheckbox"
                  />
                  <label className="form-check-label " htmlFor="selectAllCheckbox">
                    Select All
                  </label>
                </div>

                {/* Table-style layout */}
                <table className="table table-bordered border-white table-hover bg-secondary rounded table-sm ">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center"><p>Select</p></th>
                      <th scope="col"><p> informations</p></th>
                    </tr>
                  </thead>
                  <tbody>
                {teamMembers.length > 0 ? (
                  teamMembers.map((member, index) => (
                    <tr key={index}>
                      <td className="text-center bg-secondary">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value={member.email}
                          checked={assignEmail.includes(member.email)}
                          onChange={handleEmailSelect}
                          id={`checkbox-${index}`}
                        />
                      </td>
                      <td className="bg-secondary">
                        <label htmlFor={`checkbox-${index}`} className="bg-secondary">
                        {member.name} -
                         ({member.role === "employee" ? "Teammate" : member.role})
                        
                        </label>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center text-muted ">
                      No team members found in your Team ID.
                    </td>
                  </tr>
                )}
              </tbody>
                </table>
              </div>


                <textarea type="text" className='textarea' placeholder="Tag Any information   or message to your temmates.." value={moduleSummury} onChange={(e) => setModuleId(e.target.value)}  
                 style={{width:'100%',maxHeight: '150px',overflowY: 'scroll', marginTop:'4px',borderRadius:'0.5rem',border:'none'}} />

                <center>
                    <div className="button-group">
                        <button type="button" className="back-btn m-4 bg-warning px-3" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="submit-btn px-2 mt-4 my-4">Create Task</button>
                    </div>
                </center>
            </form>
        </div>
        </div>
    );
};

export default CreateTask;
