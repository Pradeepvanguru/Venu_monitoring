import { AiOutlineCloudDownload } from "react-icons/ai"; 
import { IoMdEye } from "react-icons/io"; 
// all your imports stay the same
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import EmployeeSidebar from './EmployeeSidebar';
import './FileModules.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { notification } from 'antd';
import { useNavigate } from 'react-router-dom';

// component starts
const FileModules = () => {
  const [moduleId, setModuleId] = useState('');
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [email, setEmail] = useState('');
  const [newname, setNewname] = useState('');
  const [newModuleId, setNewModuleId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // ⬅️ Add this at the top

  const token = localStorage.getItem('userToken');
  const role = localStorage.getItem('userRole');
  const loggedInUserEmail = localStorage.getItem('loggedInEmail');
  const selectedName = localStorage.getItem('userName');
  const selectedTask = JSON.parse(localStorage.getItem("selectedTask"));

  // 🆕 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5; // change this to adjust how many items per page

  const handleAction = async (moduleId, dayIndex, action) => {
    const email = selectedUser?.email || newEmail;
    const selectedName = localStorage.getItem('userName');
    const teamleadEmail = localStorage.getItem('loggedInEmail');
    try {
      const res = await axios.post(`${process.env.REACT_APP_URL}/api/data/${moduleId}/${dayIndex}/${email}/action`, {
        action,
        teammateEmail: email,
        teammateName: selectedUser?.name || newname || selectedName,
        actionByName: selectedName,
        actionByEmail: teamleadEmail
      });
      notification.success  ({ message: "" + res.data.message });
      handlerefresh();
    } catch (error) {
      console.error('Action error:', error);
      alert('Failed to perform action');
    }
  };

  useEffect(() => {
    if (selectedTask?.assignEmail?.[0]) {
      setNewEmail(selectedTask.assignEmail[0]);
      setNewModuleId(selectedTask.moduleId);
    }
  }, [selectedTask]);

  const fetchFilesByEmail = async (email, moduleId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/api/datafetch/${email}?moduleId=${moduleId}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      const files = response?.data?.files;
      setNewname(response.data.newname);
      setTaskName(response.data.taskname);
      if (!files || !Array.isArray(files)) {
        setError('Invalid response format: No files found');
        setFiles([]);
        return;
      }

      const filtered = files.filter((file) => file.assignEmail === email);
      if (filtered.length === 0) {
        setError('No data found');
        setFiles([]);
      } else {
        setFiles(filtered);
        setError('');
      }
      setShowInput(false);
    } catch (err) {
      console.error('Error fetching files:', err.response ? err.response.data : err.message);
      setError('No files uploaded for this user.');
      setFiles([]);
    }
    finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => setShowInput(true);

  const handleSearch = (e) => {
    e.preventDefault();
    const selectedDate = new Date(moduleId).toDateString();
    const filtered = files.filter(file => new Date(file.createdAt).toDateString() === selectedDate);
    setFilteredFiles(filtered);
    setError(filtered.length === 0 ? "No files found for the selected date." : "");
    setCurrentPage(1); // 🆕 Reset to first page on new search
  };

  const handlerefresh = async () => {
    setLoading(true); // show loader
    try {
      await fetchFilesByEmail(newEmail, newModuleId); // only reloads table data
    } catch (err) {
      console.error(err);
    }
    setLoading(false); // hide loader
  };

  useEffect(() => {
    const email = selectedUser?.email || newEmail;
    const moduleId = newModuleId;
    setEmail(email);
    if (email && moduleId) {
      fetchFilesByEmail(email, moduleId);
      if (selectedUser?.email) {
        localStorage.removeItem("selectedTask");
      }
    }
  }, [selectedUser, newEmail, newModuleId]);

  useEffect(() => {
    if (role === 'employee') {
      fetchFilesByEmail(loggedInUserEmail);
    } else if (role === 'team-lead') {
      const teamId = localStorage.getItem('team_id');
      if (teamId) {
        axios.get(`${process.env.REACT_APP_URL}/api/team-members/${teamId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setTeamMembers(res.data))
        .catch((err) => console.error('Error fetching team members:', err));
      }
    }
  }, [role]);

  useEffect(() => {
    if (files.length > 0) {
      setFilteredFiles(files);
      setCurrentPage(1); // 🆕 Reset to first page when files change
    }
  }, [files]);

  const handleDownload = async (moduleId, dayIndex) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/api/download-file/${moduleId}/${dayIndex}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `Module-${moduleId}_Day-${dayIndex}`;
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match) filename = match[1];
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        notification.success({ message: 'Failed to download file.' });
      }
    } catch (error) {
      notification.error({ message: `Error downloading file: ${error.message}` });
    }
  };

  const handlePreview = (moduleId, dayIndex) => {
    window.open(`/file-preview/${encodeURIComponent(moduleId)}/${encodeURIComponent(dayIndex)}`, '_blank');
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
    const shortText = words.slice(0, 8).join(' ') + '...>';
    const short = capitalize(shortText);

    return (
      <h6 onClick={() => setShowFull(!showFull)} style={{ fontSize: '12px', cursor: 'pointer', color: 'gray' }}>
        <strong className='text-secondary'>Task Name:</strong> {isLong && !showFull ? short : fullText}
      </h6>
    );
  };

  // 🆕 Pagination logic
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
// className="btn btn-outline-light text-primary fs-6 mb-3"
  return (
    <div className="team-lead-interfaces container mt-4">
      {role === 'employee' ? <EmployeeSidebar /> : <Sidebar />}
      <button onClick={() => navigate(role==='employee'?'/employee-dashboard':'/team-lead-interface')} className="btn btn-outline-light text-primary fs-6 mb-3">
      
        <FontAwesomeIcon icon={faArrowLeft} /> Back
      </button>

      <h2 className="text-secondary fs-4">File Modules</h2>
      <p className="text-muted" style={{ fontSize: '14px' }}>Manage and review files and modules here.</p>

      {!showInput ? (
        <button onClick={handleSearchClick} className="btn btn-primary mb-3" style={{ fontSize: '12px' }}>
          Search Files By Date
        </button>
      ) : (
        <form onSubmit={handleSearch} className="mb-4 w-50">
          <input type="date" value={moduleId} onChange={(e) => setModuleId(e.target.value)} className="form-control mb-2" />
          <button type="submit" className="btn btn-success" disabled={!moduleId}>Search</button>
        </form>
      )}

      {error && (
        <div className="alert alert-info mx-3 w-50">
          <button className='alert alert-info border-0' onClick={() => { navigate("/file-modules") }}>
            {error} <u><i>Go Previous & Refresh!</i></u>
          </button>
        </div>
      )}

      {!error && currentFiles.length > 0 && (
        <div className="files-list bg-info-subtle p-3 rounded mt-4">
          <center className="text-secondary"><u><strong>Uploaded Data</strong></u></center>

          <button className="btn btn-info text-dark border-1 mx-1 p-2 my-2" style={{ float: 'right', fontSize: '12px' }}
            onClick={handlerefresh}>
            Show All Data
          </button>

          <h5 className="text-secondary fs-6">
            <TaskName taskName={taskName} />
            <strong style={{ fontSize: '12px' }}> Teammate Name :  {selectedUser?.name || newname || selectedName}</strong>
          </h5>
          <p className="text-danger" style={{ fontSize: '12px' }}><strong>Files Count: {filteredFiles.length}</strong></p>

          <div className="table-responsive" style={{ fontSize: '10px' }}>
            <table className="table table-bordered table-hover text-center mt-3">
              <thead className="table-secondary">
                <tr>
                  <th>Sl No.</th>
                  <th>Day/Date/Time</th>
                  <th>Preview</th>
                  <th>Download</th>
                  {role === 'team-lead' && <><th>Actions</th><th>Status</th></>}
                </tr>
              </thead>
              <tbody>
                {currentFiles.map((file, index) => (
                  <tr key={index}>
                    <td>{indexOfFirstFile + index + 1}</td>
                    <td> <strong>Day {file.dayIndex} - </strong>
                      {new Date(file.createdAt).toLocaleString('en-GB', {
                        weekday: 'long', day: '2-digit', month: '2-digit', year: '2-digit',
                        hour: '2-digit', minute: '2-digit', hour12: true,
                      })}</td>
                    <td><button className="btn  btn-outline-info text-dark" style={{fontSize:'10px'}} onClick={() => handlePreview(file.moduleId, file.dayIndex)}>Show <IoMdEye  fontSize={20}/></button></td>
                    <td><button className="btn btn-sm btn-outline-success text-info" onClick={() => handleDownload(file.moduleId, file.dayIndex)}><AiOutlineCloudDownload fontSize={20} /></button></td>
                    {role==='team-lead'?<><td>
                      <button type="button" className="btn btn-success btn-sm"  style={{fontSize:'8px'}} onClick={() => handleAction(file.moduleId, file.dayIndex, 'accept')}>Aproved</button>
                      <button type="button" className="btn btn-danger btn-sm ms-2"  style={{fontSize:'8px'}} onClick={() => handleAction(file.moduleId, file.dayIndex, 'reject')}>Not Saticefied </button>
                    </td> 
                    <td>
                    <b style={{ color: file.Actions === 'accept' ? 'green' : file.Actions === 'reject' ? 'red' : 'black' }}>
                      {file.Actions.charAt(0).toUpperCase() + file.Actions.slice(1)}
                    </b>
                  </td>


                    </>
                    :''}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🆕 Pagination Buttons */}
          <div className="d-flex justify-content-center mt-3">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`btn btn-sm mx-1 ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileModules;
