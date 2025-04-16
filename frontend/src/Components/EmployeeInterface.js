import React, { useState } from 'react';
import useFetchTask from './useFetchTask';
import Progressbar from './progressbar';
import EmployeeSidebar from './EmployeeSidebar';
import './EmployeeInterface.css';
import { format } from 'date-fns';
import { message, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaLink, FaPaperPlane, FaTrash } from 'react-icons/fa'; 

const TaskModules = () => {
  const navigate = useNavigate();
  const { task, loading, error } = useFetchTask();
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const handleSubmission = async (dayIndex) => {
    const fileInput = document.getElementById(`file-input-Day-${dayIndex}`);
    const files = fileInput?.files[0];

    if (!files || files.length === 0) {
      notification.info({ message: 'Please select files to upload.' });
      return;
    }

    const assignEmail = task?.assignEmail;
    if (!assignEmail) {
      notification.info({ message: 'User email is missing.' });
      return;
    }

    const formData = new FormData();
    formData.append('files', files);
    formData.append('moduleId', task.moduleId);
    formData.append('assignEmail', assignEmail);
    formData.append('dayIndex', dayIndex);

    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/api/submit-task`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json();
        console.error('Submission failed:', result);
        notification.error({message:`Submission failed: ${result.message}`});
        return;
      }

      notification.success({ message: 'Files uploaded successfully!' });
      window.location.reload();
    } catch (error) {
      console.error('Error during submission:', error);
      notification.error({ message: `Error during submission: ${error.message}` });
    }
  };

  // const handleClearAll = async () => {
  //   if (window.confirm('Are you sure you want to delete all data?')) {
  //     try {
  //       await axios.delete(`${process.env.REACT_APP_URL}/api/clear-data`);
  //       notification.success({ message: 'All data cleared!' });
  //     } catch (err) {
  //       console.error(err);
  //       alert('Error clearing data');
  //     }
  //   }
  // };

  const handlerefresh = () => {
    window.location.reload();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!task) return <div>No task found for this employee.</div>;

  const formattedStartDate = format(new Date(task.startDate), 'dd MMM yyyy');
  const formattedEndDate = format(new Date(task.endDate), 'dd MMM yyyy');
  const totalDays = Math.ceil((new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24));
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentDays = [...Array(totalDays)].slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(totalDays / recordsPerPage);

  const handleDelete = async (dayIndex) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const assignEmail = task?.assignEmail;
        if (!assignEmail) {
          notification.info({ message: 'User email is missing.' });
          return;
        }
  
        const response = await axios.delete(`${process.env.REACT_APP_URL}/api/delete-task`, {
          data: { dayIndex, assignEmail, moduleId: task.moduleId }
        });
  
        if (response.status === 200) {
          notification.success({ message: 'Entry deleted successfully!' });
          window.location.reload(); // Or update state instead
        } else {
          notification.error({ message: 'Failed to delete entry.' });
        }
      } catch (error) {
        console.error('Delete error:', error);
        notification.error({ message: `Error: ${error.message}` });
      }
    }
  };
  const start = format(new Date(task.startDate), 'dd MMM yyyy');
  const end = format(new Date(task.endDate), 'dd MMM yyyy');

  return (
    <div className="employee-task-page-container">
      <div className="employee-task-sidebar">
        <EmployeeSidebar />
      </div>

      <div className="employee-task-module-container">
        <div className="employee-task-box container">
          <center>
            <strong className="text-dark fs-4">{task.taskName}</strong>
          </center>
          <div>
          <strong className="text-dark">Module ID: <>{task.moduleId}</></strong><br></br>
          <strong className="text-primary">Start Date: <>{start}</></strong><br></br>
          <strong className="text-danger">End Date: <>{end}</></strong>
          </div>
        </div>

        <div className="employee-task-progress mb-4 p-5">
          <Progressbar moduleID={task.moduleId} />
        </div>

        <div className="employee-task-table-wrapper">
          <button className="employee-task-refresh btn btn-info text-dark border-1 mx-1 p-2 my-2" style={{ float: 'right' }} onClick={handlerefresh}>Refresh</button>
          {/* <button onClick={handleClearAll} className="employee-task-clear btn btn-danger mb-2">Clear All Data</button> */}

          <table className="employee-task-table">
            <thead>
              <tr>
                <th>Day No.</th>
                <th>Day (Date)</th>
                <th>View Data</th>
                <th>Upload Data</th>
                <th>Submission Status</th>
                <th>Delete</th>

              </tr>
            </thead>
            <tbody>
              {currentDays.map((_, i) => {
                const index = indexOfFirstRecord + i;
                const submission = task.submissions[index];
                const currentDate = new Date(task.startDate);
                currentDate.setDate(currentDate.getDate() + index);
                const isSubmitted = !!submission;
                const isRejected = submission?.action === "reject";

                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{format(currentDate, 'dd MMM yyyy')}</td>
                    <td>
                      {isSubmitted ? (
                        <button className="employee-task-view-btn" onClick={() => navigate('/file-modules')}> <FaEye size={17} color="#ffff" title="View File" /></button>
                      ) : 'No data'}
                    </td>
                    <td>
                      <label htmlFor={`file-input-Day-${index + 1}`} className={`employee-task-upload-label ${(isSubmitted && !isRejected) ? 'employee-task-disabled-label' : ''}`}><FaLink size={17} color="#1313g" title="uploads"/></label>
                      <input
                        type="file"
                        id={`file-input-Day-${index + 1}`}
                        className="employee-task-file-input-hidden"
                        disabled={isSubmitted && !isRejected}
                      />
                      <button
                        className={`employee-task-submit-btn ${(isSubmitted && !isRejected) ? 'employee-task-disabled-btn' : ''}`}
                        onClick={() => handleSubmission(index + 1)}
                        disabled={isSubmitted && !isRejected}
                      >
                        {(isSubmitted && !isRejected) ? '☑️' : <strong className="text-info"><u>Submit</u></strong>}
                      </button>
                    </td>
                    <td>{isRejected ? 'Reuploaded - Pending' : submission?.action || "Pending"}</td>
                    <td>
                    {isSubmitted && (
                      <button
                        className="employee-task-delete-btn"
                        onClick={() => handleDelete(index + 1)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </td>

                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ textAlign: 'center', margin: '30px' }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`btn mx-1 ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline-primary text-dark'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
        {/* Inline Styles */}
  <style>
  {`

  .employee-task-delete-btn {
  background-color: transparent;
  border: none;
  font-size: 18px;
  color: #dc3545;
  cursor: pointer;
}

.employee-task-delete-btn:hover {
  color: #c82333;
}

  .employee-task-upload-label {
    display: inline-block;
    padding: 5px 10px;
    background-color:rgba(97, 128, 170, 0.44);
    border-radius: 5px;
    cursor: pointer;
    color: #333;
    font-size: 16px;
    margin-bottom: 5px;
    border: 1px solid #ccc;
    transition: background-color 0.3s ease;
  }

  .employee-task-upload-label:hover {
    background-color: #e2e6ea;
  }

 

  .employee-task-disabled-label {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .employee-task-file-input-hidden {
    display: none;
  }

  .employee-task-table-wrapper {
    overflow-x: auto;
    margin: 20px;
  }

  .employee-task-table {
    width: 100%;
    border-collapse: collapse;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-radius: 10px;
    margin-bottom: 20px;
    height:100px;
    positon:relative;
    overflow-y:auto;
  }

  .employee-task-table th,
  .employee-task-table td {
    padding: 12px 16px;
    text-align: center;
    border-bottom: 1px solid #ddd;
  }

  .employee-task-table th {
    background-color: #343a40;
    color: #ffff;
  }

  .employee-task-submit-btn {
    background-color: white;
    margin:1px;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
  }

  .employee-task-disabled-btn {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  .employee-task-view-btn {
    background-color:rgba(40, 167, 70, 0.82);
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 5px;
    cursor: pointer;
  }

  .employee-task-view-btn:hover {
    background-color:rgba(33, 136, 55, 0.59);
  }

  .employee-task-refresh {
    float: right;
  }

  .employee-task-clear {
    margin-bottom: 10px;
  }

  .employee-task-box {
    padding: 1rem;
  }

  .employee-task-page-container {
    display: flex;
    width: 100%;
    height: 100vh;
    overflow-y: auto;
    margin-bottom:10px;
   
  }
   .employee-task-page-container::-webkit-scrollbar{
   display:none;}

  .employee-task-sidebar {
    width: 25%;
    min-width: 250px;
    max-width: 300px;
    background-color: #f8f9fa;
  }

  .employee-task-module-container {
    width: 75%;
    padding: 1rem;
  }
  `}
</style>
    </div>
  );
};

export default TaskModules;


