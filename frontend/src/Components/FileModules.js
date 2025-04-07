import React, { useState, useEffect } from 'react';
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
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [previous,setpreveious]=useState()
  const token = localStorage.getItem('userToken');
  const role = localStorage.getItem('userRole'); // Get role from localStorage
  const loggedInUserEmail = localStorage.getItem('loggedInEmail');

  const fetchFilesByEmail = async (email) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/api/datafetch/${email}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
  
      const files = response?.data?.files;
  
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
      setShowInput(false)
    } catch (err) {
      console.error('Error fetching files:', err.response ? err.response.data : err.message);
      setError('No files uploaded for this user.');
      setFiles([]);
    }
  };
  

  const handleSearchClick = () => {
    setShowInput(true);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const emailToSearch = selectedUser?.email || loggedInUserEmail;
    if (emailToSearch) {
      setpreveious(emailToSearch)
      await fetchFilesByEmail(emailToSearch);
      if (moduleId !== '') {
        setFiles((prevFiles) =>
          prevFiles.filter((file) => file.dayIndex.toString() === moduleId)
        );
      }
    }
  };
  
  useEffect(() => {
    if (selectedUser?.email) {
      fetchFilesByEmail(selectedUser.email);
    }
  }, [selectedUser]);
  

  const handleDownload = async (moduleId, dayIndex) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/api/download-file/${moduleId}/${dayIndex}`, {
        headers:{Authorization:`Bearer ${token}`,'Content-Type': 'multipart/form-data'}
       
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

  const handlePreview = async (moduleId, dayIndex) => {
    setFileUrl(`${process.env.REACT_APP_URL}/api/view-file/${moduleId}/${dayIndex}`,
      {
        headers:{Authorization:`Bearer ${token}`,'Content-Type': 'multipart/form-data'}
       
      }
    );
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setFileUrl('');
  };

  useEffect(() => {
    if (role === 'employee') {
      fetchFilesByEmail(loggedInUserEmail);
    } else if (role === 'team-lead') {
      const teamId = localStorage.getItem('team_id');
      if (teamId) {
        axios.get(`${process.env.REACT_APP_URL}/api/team-members/${teamId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
          setTeamMembers(res.data);
          console.log('Fetched team members:', res.data);
        }).catch((err) => {
          console.error('Error fetching team members:', err);
        });
      }
    }
  }, [role]);
  

 const handlerefresh=()=>{
  fetchFilesByEmail(previous)
 }
  

  const limitedFiles = files.slice(0, 10);
  const selectedname=localStorage.getItem('userName')

  return (
    <div className="team-lead-interfaces container mt-4">
    {role ==='employee' ? <EmployeeSidebar/>:<Sidebar />}
    {role === 'team-lead' && (
      <>
      <button onClick={() => window.history.back()} className="btn btn-outline-light text-primary fs-6 mb-3">
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <h2 className="text-secondary">File Modules</h2>
        <h4 className="text-secondary">Team Members:</h4>
        <table className="table table-bordered table-hover table-dark rounded shadow-sm w-50">
          <thead className="thead-light ">
            <tr >
              <th className='text-info' scope='col-1'> Sl no.</th>
              <th  className='text-info' scope="col-1" >Name & Role</th>
             
            </tr>
          </thead>
          <tbody>
            {teamMembers.length > 0 ? (
              teamMembers.map((member, index) => (
                <tr key={index} onClick={() => setSelectedUser(member)} style={{ cursor: "pointer" }}>
                <td>{index}</td>
                  <td>{member.name} ({member.role})</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="text-center text-muted">No team members found in your Team ID.</td>
              </tr>
            )}
            
          </tbody>
        </table>
        <div>
        <p className="text-muted">Manage and review files and modules here.</p>
  
        {!showInput ? (
          <button onClick={handleSearchClick} className="btn btn-primary mb-3">
            Search Files Day Index
          </button>
        ) : (
          <form onSubmit={handleSearch} className="mb-4 w-50">
            <input
              type="text"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              placeholder="Enter Module Day Index"
              className="form-control mb-2"
            />
            <button type="submit" className="btn btn-success" disabled={moduleId === ''}>
              Submit
            </button>
          </form>
        )}
        </div>
  
        {limitedFiles.length > 0 && (
          <div className="files-list  bg-info-subtle p-2 rounded">
          <center className='text-secondary'><u><strong>Uploaded Data</strong></u></center>
          <button type="submit" className="btn btn-info text-dark border-1 mx-1 p-2 my-2" style={{float:'right'}} onClick={()=>{handlerefresh()}} >show All Data</button>
            <h5 className="text-primary"><u><strong>Files of {selectedUser?.name || "Selected Member"}:</strong></u></h5>
            <p className="text-danger">Count: {limitedFiles.length}</p>
            <div className="row">
              {limitedFiles.map((file, index) => (
                <div key={index} className="custom-col mb-1">
                  <div className="card bg-dark text-light shadow-sm  ">
                    <div className="card-body">
                     <center> <h6 className="card-title">Day {file.dayIndex}</h6></center>
                      <div className="d-flex justify-content-evenly ">
                        <button onClick={() => handleDownload(file.moduleId, file.dayIndex)} className="btn btn-outline-primary btn-sm">
                          <i className="fas fa-download"></i> 
                        </button>
                        <button onClick={() => handlePreview(file.moduleId, file.dayIndex)} className="btn btn-outline-info btn-sm">
                          <i className="fas fa-eye"></i> 
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    )}
  
    {role === 'employee' && (
      <>
        <button onClick={() => window.history.back()} className="btn btn-outline-white text-primary mb-3">
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
  
        <h2 className="text-secondary">File Modules</h2>
        <p className="text-muted">Manage and review files and modules here.</p>
  
        {!showInput ? (
          <button onClick={handleSearchClick} className="btn btn-primary mb-3">
            Search Files Day Index
          </button>
        ) : (
          <form onSubmit={handleSearch} className="mb-4">
            <input
              type="text"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              placeholder="Enter Module Day Index"
              className="form-control mb-2"
            />
            <div className='row '>
              <div className="col-md-6">
              <button type="submit" className="btn btn-success" disabled={moduleId === ''}>
              Submit
            </button>
              
              </div>

            </div>

          </form>
        )}
  
        {error && (
          <div className="alert alert-danger mt-3">{error}</div>
        )}
  
        <div className="files-list mt-5 bg-info-subtle p-3 rounded ">
    <center className="text-secondary"><u><strong>Uploaded Data</strong></u></center>
    <button type="submit" className="btn btn-info text-dark border-1 mx-1 p-2 my-2" style={{float:'right'}} onClick={()=>{fetchFilesByEmail(loggedInUserEmail)}} >show All Data</button>
  <h6 className="text-primary"><u><strong>Files of {selectedUser?.name || selectedname}:</strong></u></h6>
  <p className="text-danger"><strong>Count: {limitedFiles.length}</strong></p> 

  <div className="row">
    {limitedFiles.map((file, index) => (
      <div key={index} className="custom-col mb-1">
        <div className="card bg-dark text-light shadow-sm">
          <div className="card-body">
            <center><h6 className="card-title">Day {file.dayIndex}</h6></center>
            <div className="d-flex justify-content-evenly">
              <button onClick={() => handleDownload(file.moduleId, file.dayIndex)} className="btn btn-outline-primary btn-sm">
                <i className="fas fa-download"></i>
              </button>
              <button onClick={() => handlePreview(file.moduleId, file.dayIndex)} className="btn btn-outline-info btn-sm">
                <i className="fas fa-eye"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

      </>
    )}
  
    {showPreview && (
      <div className="team-lead-interfaces">
     <div className="preview-overlay">
    <div className="rounded  position-relative">
      <button
        onClick={closePreview}
        className="btn btn-danger position-absolute top-0 end-0 m-1 "
      >
        X
      </button>
      <iframe
        src={fileUrl}
        width="800"
        height="500"
        title="File Preview"
        style={{ border: 'none' }}
      ></iframe>
    </div>
  </div>
</div>

    )}
  </div>
  
  
  );
};

export default FileModules;
