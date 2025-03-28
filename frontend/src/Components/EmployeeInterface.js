import React, { useState } from 'react';
import useFetchTask from './useFetchTask'; // Custom hook for fetching task
import Progressbar from './progressbar';
import EmployeeSidebar from './EmployeeSidebar';
import './EmployeeInterface.css';
import { format } from 'date-fns';
import {message, notification} from 'antd'

const TaskModules = () => {
  const { task, loading, error } = useFetchTask(); // Fetch task by the logged-in email
  const handleSubmission = async (dayIndex) => {
  const fileInput = document.getElementById(`file-input-Day-${dayIndex}`);
    const file = fileInput?.files[0];
    

  if (!file) {
    notification.info({message:'Please select a file to upload.'});
    return;
    }
   const assignEmail =  task?.assignEmail; // Ensure this variable has a valid value
 // Replace `user` with the appropriate context or state holding the email
  if (!assignEmail) {
    notification.info({message:'User email is missing.'});
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('moduleId', task.moduleId); // Ensure this is valid
  formData.append('assignEmail', assignEmail);// Replace with appropriate user email value
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

    // console.log('File uploaded successfully:', await response.json());
   
    notification.success({message:'File uploaded successfully!'});
     // Reload the page after successful submission
     window.location.reload();
  } catch (error) {
    console.error('Error during submission:', error);
    notification.error(`Error during submission: ${error.message}`);
  }
};


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!task) return <div>No task found for this employee.</div>;

  // Format start and end dates using date-fns
  const formattedStartDate = format(new Date(task.startDate), 'dd MMM yyyy');
  const formattedEndDate = format(new Date(task.endDate), 'dd MMM yyyy');

  const totalDays = Math.ceil((new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24));
  const count=task.submissions.length
  // console.log(count,"count")

  return (
    <div className="page-container">
      <EmployeeSidebar />
      <div className="task-module-container">
        <div className="container border p-5 m-2   rounded bg-secondary ">
          <h2 className="text-center mb-4">{task.taskName}</h2>
         
          <center>
          <b><h2 className="mb-4">Module ID: {task.moduleId}</h2></b>
          <h2>
            Upload the Daily Work Here ...!
          </h2>
          </center>
          {/* <p><b>Problem statement :</b> Success is built on consistency and commitment. Let's push through, stay focused, and complete our tasks on time. 
  Your task started on {formattedStartDate} and is due by {formattedEndDate}. 
  Together, we can achieve great things! Stay focused and give it your best effort!</p> */}
        </div>

        {/* Progress Bar */}
        <div className="mb-4 p-5 ">
          <Progressbar moduleID={task.moduleId} />
        </div>

        {/* Submission for Each Day */}
        <div className="submission-grid row">
          {[...Array(totalDays)].map((_, index) => (
            <div key={index} className="col-12 col-md-4 col-lg-3 mb-4">
              <div className="submission-item p-3 border rounded">
                <label htmlFor={`file-input-Day-${index + 1}`} className="form-label">
                  Upload File for Day-{index + 1}
                </label>
                <input type="file" id={`file-input-Day-${index + 1}`} className="form-control mb-2" disabled={index < count} />
                <center>
                  <button
                    className={`btn w-20 ${index < count ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => handleSubmission(index + 1)}
                    disabled={index < count} // Disable button if the day's submission exists
                  >
                    Day-{index + 1}
                  </button>
                </center>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskModules;
