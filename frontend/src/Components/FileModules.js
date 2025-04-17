import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import EmployeeSidebar from './EmployeeSidebar';
import './FileModules.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { notification } from 'antd';


const FileModules = () => {
 
  const [moduleId, setModuleId] = useState('');
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [previous, setPrevious] = useState('');
  const [newname,setNewname]=useState('')
  const [newId, setNewId] = useState('');


  const token = localStorage.getItem('userToken');
  const role = localStorage.getItem('userRole');
  const loggedInUserEmail = localStorage.getItem('loggedInEmail');
  const selectedName = localStorage.getItem('userName');
  const selectedTask = JSON.parse(localStorage.getItem("selectedTask"));
 

  const imageRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 1));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.3));

 

  const handleAction = async (moduleId, dayIndex, action,email) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_URL}/api/data/${moduleId}/${dayIndex}/${email}/action`, {
        action
      });
      notification.info({message:""+res.data.message});
      handlerefresh()
      // Optionally: Refresh your files or data state here
    } catch (error) {
      console.error('Action error:', error);
      alert('Failed to perform action');
    }
  };
  

  

  useEffect(() => {
    if (selectedTask?.assignEmail?.[0]) {
      setNewId(selectedTask.assignEmail[0]);
    }
  }, [selectedTask]);

  const fetchFilesByEmail = async (email) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/api/datafetch/${email}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      const files = response?.data?.files;
      setNewname(response.data.newname)
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
        setPrevious(email);
      }
      setShowInput(false);
    } catch (err) {
      console.error('Error fetching files:', err.response ? err.response.data : err.message);
      setError('No files uploaded for this user.');
      setFiles([]);
    }
  };

  const handleSearchClick = () => setShowInput(true);

  const handleSearch = (e) => {
    e.preventDefault();
    const selectedDate = new Date(moduleId).toDateString();
    const filtered = files.filter(file => new Date(file.createdAt).toDateString() === selectedDate);

    setFilteredFiles(filtered);
    setError(filtered.length === 0 ? "No files found for the selected date." : "");
  };

  const handlerefresh = () => {
    if (previous) fetchFilesByEmail(previous);
  };

  useEffect(() => {
    const email = selectedUser?.email || newId;
    if (email) {
      fetchFilesByEmail(email);
  
      if (selectedUser?.email) {
        localStorage.removeItem("selectedTask");
      }
    }
  }, [selectedUser, newId]);
  

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
        notification.info({ message: 'Failed to download file.' });
      }
    } catch (error) {
      notification.error({ message: `Error downloading file: ${error.message}` });
    }
  };

  const handlePreview = (moduleId, dayIndex) => {
    setFileUrl(`${process.env.REACT_APP_URL}/api/view-file/${moduleId}/${dayIndex}`);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setFileUrl('');
  };




  const handleImageLoad = () => {
    
    const img = imageRef.current;
    if (!img) return;

    const modalWidth = 800; // Or get this dynamically
    const modalHeight = 600;

    const originalWidth = img.naturalWidth;
    const originalHeight = img.naturalHeight;

    const widthRatio = modalWidth / originalWidth;
    const heightRatio = modalHeight / originalHeight;
    const scaleRatio = Math.min(widthRatio, heightRatio, 1); // Never upscale

    img.style.width = `${originalWidth * scaleRatio}px`;
    img.style.height = `${originalHeight * scaleRatio}px`;
  };
  
  // const handleClearAll = async () => {
  //   if (window.confirm('Are you sure you want to delete all data?')) {
  //     try {
  //       await axios.delete(`${process.env.REACT_APP_URL}/api/clear-data`); // or /clear-task-submissions
  //       alert('All data cleared!');
  //       // Optionally refresh the table data here
  //     } catch (err) {
  //       console.error(err);
  //       alert('Error clearing data');
  //     }
  //   }
  // };

  return (
    <div className="team-lead-interfaces container mt-4">
      {role === 'employee' ? <EmployeeSidebar /> : <Sidebar />}

      <button onClick={() => window.history.back()} className="btn btn-outline-light text-primary fs-6 mb-3">
        <FontAwesomeIcon icon={faArrowLeft} /> Back
      </button>

      <h2 className="text-secondary">File Modules</h2>

      {role === 'team-lead' && (
        <>
          <h6 className="text-secondary">Select Teammates:</h6>
          <table className="table table-bordered table-hover table-dark rounded shadow-sm w-50">
            <thead className="thead-light">
              <tr>
                <th className="text-info">Sl no.</th>
                <th className="text-info">Name & Role</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.length > 0 ? (
                teamMembers.map((member, index) => (
                  <tr key={index} onClick={() => setSelectedUser(member)} style={{ cursor: 'pointer' }}>
                    <td>{index + 1}</td>
                    <td>{member.name} - ({member.role === 'employee' ? 'Teammate' : member.role})</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center text-muted">No team members found in your Team ID.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      <p className="text-muted">Manage and review files and modules here.</p>

      {!showInput ? (
        <button onClick={handleSearchClick} className="btn btn-primary mb-3">
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
          <button className='alert alert-info border-0' onClick={() => role === 'employee' ? fetchFilesByEmail(loggedInUserEmail) : handlerefresh()}>
            {error} <u><i>click here to back !</i></u>
          </button>
        </div>
      )}

      {!error && filteredFiles.length > 0 && (
        <div className="files-list bg-info-subtle p-3 rounded mt-4">
          <center className="text-secondary"><u><strong>Uploaded Data</strong></u></center>

          <button className="btn btn-info text-dark border-1 mx-1 p-2 my-2" style={{ float: 'right' }}
            onClick={() => role === 'employee' ? fetchFilesByEmail(loggedInUserEmail) : handlerefresh()}>
            Show All Data
          </button>

          <h5 className="text-primary">
            <u><strong>Files of {selectedUser?.name ||newname || selectedName }:</strong></u>
          </h5>
          <p className="text-danger"><strong>Files Count: {filteredFiles.length}</strong></p>
          <>
          {/* <button onClick={handleClearAll} className="btn btn-danger mb-2">
           Clear All Data
          </button> */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover text-center mt-3">
              <thead className="table-secondary">
                <tr>
                  <th>Sl No.</th>
                  <th>Day/Date</th>
                  <th>Preview</th>
                  <th>Download</th>
                {role==='team-lead'? <><th>Actions</th> 
                <th>Status</th></>:''}
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>Day {file.dayIndex} - </strong>
                      {new Date(file.createdAt).toLocaleString('en-GB', {
                        day: '2-digit', month: '2-digit', year: '2-digit',
                        hour: '2-digit', minute: '2-digit', hour12: true,
                      })}
                    </td>
                    <td>
                      <button onClick={() => handlePreview(file.moduleId, file.dayIndex)}
                        className="btn btn-outline-info btn-sm text-dark">
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleDownload(file.moduleId, file.dayIndex)}
                        className="btn btn-outline-info text-dark btn-sm">
                        <i className="fas fa-download"></i>
                      </button>
                    </td>
                    {role==='team-lead'?<><td>
                      <button type="button" className="btn btn-success btn-sm"  style={{fontSize:'8px'}} onClick={() => handleAction(file.moduleId, file.dayIndex, 'accept')}>Accept</button>
                      <button type="button" className="btn btn-danger btn-sm ms-2"  style={{fontSize:'8px'}} onClick={() => handleAction(file.moduleId, file.dayIndex, 'reject')}>Reject</button>
                    </td> 
                    <td>{file.Actions}</td>
                    </>
                    :''}
                  </tr>
                ))}
              </tbody>
            </table>   
          </div>
          </>
        </div>
      )}

      {showPreview && (
        <div className={`preview-modal ${minimized ? 'minimized' : ''} ${maximized ? 'maximized' : ''}`}>
          <div className="modal-content">
          {fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
        <img
          src={fileUrl}
          alt="Preview"
          ref={imageRef}
          className="zoomed-image"
          style={{ '--zoom-scale': zoomLevel }}
          onLoad={handleImageLoad}
        />
      ) : (
        <iframe
          src={fileUrl}
          title="File Preview"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        />
      )}
            <div className="zoom-controls">
              {/* <button className="btn btn-sm btn-info" onClick={handleZoomIn}>Zoom In</button>
              <button className="btn btn-sm btn-info" onClick={handleZoomOut}>Zoom Out</button> */}
              <button className="btn btn-sm btn-danger" onClick={closePreview}>Close</button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default FileModules;
