import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import EmployeeSidebar from './EmployeeSidebar';
import './FileModules.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { notification } from 'antd';
import { Tooltip } from 'react-bootstrap';

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

  const token = localStorage.getItem('userToken');
  const role = localStorage.getItem('userRole');
  const loggedInUserEmail = localStorage.getItem('loggedInEmail');
  const selectedName = localStorage.getItem('userName');

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
        setPrevious(email); // Store for refresh
      }
      setShowInput(false);
    } catch (err) {
      console.error('Error fetching files:', err.response ? err.response.data : err.message);
      setError('No files uploaded for this user.');
      setFiles([]);
    }
  };

  const handleSearchClick = () => {
    setShowInput(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  
    const selectedDate = new Date(moduleId).toDateString(); // Normalize format
  
    const filtered = files.filter(file => {
      const fileDate = new Date(file.createdAt).toDateString(); // Normalize format
      return fileDate === selectedDate;
    });
  
    if (filtered.length === 0) {
      setError("No files found for the selected date.");
    } else {
      setError("");
    }
  
    setFilteredFiles(filtered);
  };
  

  const handlerefresh = () => {
    if (previous) fetchFilesByEmail(previous);
  };

  useEffect(() => {
    if (selectedUser?.email) {
      fetchFilesByEmail(selectedUser.email);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (role === 'employee') {
      fetchFilesByEmail(loggedInUserEmail);
    } else if (role === 'team-lead') {
      const teamId = localStorage.getItem('team_id');
      if (teamId) {
        axios.get(`${process.env.REACT_APP_URL}/api/team-members/${teamId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            setTeamMembers(res.data);
          })
          .catch((err) => {
            console.error('Error fetching team members:', err);
          });
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

  return (
    <div className="team-lead-interfaces container mt-4">
      {role === 'employee' ? <EmployeeSidebar /> : <Sidebar />}

      <button onClick={() => window.history.back()} className="btn btn-outline-light text-primary fs-6 mb-3">
        <FontAwesomeIcon icon={faArrowLeft} /> Back
      </button>

      <h2 className="text-secondary">File Modules</h2>

      {role === 'team-lead' && (
        <>
          <h6 className="text-secondary">Select Team Members:</h6>
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
                  <tr key={index} onClick={() => setSelectedUser(member)} className="members" style={{ cursor: 'pointer' }}>
                    <td>{index + 1}</td>
                    <td>{member.name} - ({member.role === 'employee' ? 'Teammate' : member.role})</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center text-muted">
                    No team members found in your Team ID.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      <p className="text-muted">Manage and review files and modules here.</p>

      {!showInput ? (
        <button onClick={handleSearchClick} className="btn btn-primary mb-3">
          Search Files Day Index
        </button>
      ) : (
        <form onSubmit={handleSearch} className="mb-4 w-50">
          <input
            type="date"
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="form-control mb-2"
          />
          <button type="submit" className="btn btn-success" disabled={!moduleId}>
            Submit
          </button>
        </form>
      )}

      {error && <div className="alert alert-info mx-3 w-50"><button className='alert alert-info border-0 '            onClick={() => {
     role === 'employee' ? fetchFilesByEmail(loggedInUserEmail) : handlerefresh();}}>{error} <u><i>click here to back !</i></u></button></div>}

      {filteredFiles.length > 0 && (
        <div className="files-list bg-info-subtle p-3 rounded mt-4">
          <center className="text-secondary">
            <u><strong>Uploaded Data</strong></u>
          </center>

          <button
            className="btn btn-info text-dark border-1 mx-1 p-2 my-2"
            style={{ float: 'right' }}
            onClick={() => {
  role === 'employee' ? fetchFilesByEmail(loggedInUserEmail) : handlerefresh();
            }}
          >
            Show All Data
          </button>

          <h5 className="text-primary">
            <u><strong>Files of {selectedUser?.name || selectedName || 'Selected Member'}:</strong></u>
          </h5>
          <p className="text-danger"><strong>Files Count: {filteredFiles.length}</strong></p>

          <div className="table-responsive">
            <table className="table table-bordered table-hover text-center mt-3">
              <thead className="table-secondary">
                <tr>
                  <th>Sl No.</th>
                  <th>Day</th>
                  <th>Preview</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>Day {file.dayIndex} - </strong>
                      {new Date(file.createdAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </td>
                    <td>
                      <button
                        onClick={() => handlePreview(file.moduleId, file.dayIndex)}
                        className="btn btn-outline-info text-info-emphasis btn-sm"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDownload(file.moduleId, file.dayIndex)}
                        className="btn btn-outline-primary text-dark btn-sm"
                      >
                        <i className="fas fa-download"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="preview-overlay">
          <div className="rounded position-relative">
            <button
              onClick={closePreview}
              className="btn btn-danger position-absolute top-0 end-0 m-1"
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
      )}

      <Tooltip anchorselect=".table" place="right">
        Click here for Data
      </Tooltip>
    </div>
  );
};

export default FileModules;
