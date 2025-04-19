import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCopy, faRedo } from '@fortawesome/free-solid-svg-icons';
import { notification } from 'antd';

const FilePreview = () => {
  const { moduleId, dayIndex } = useParams();
  const navigate = useNavigate();
  const imageRef = useRef(null);

  const [rotation, setRotation] = useState(0);
  const [fileType, setFileType] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFileInfo = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_URL}/api/file-info/${moduleId}/${dayIndex}`);
        const data = await res.json();
        setFileType(data.fileType);
        setFileName(data.fileName);
        setFileUrl(`${process.env.REACT_APP_URL}/api/view-file/${moduleId}/${dayIndex}`);
      } catch (err) {
        console.error('Failed to fetch file info:', err);
        notification.error({ message: 'Failed to fetch file info.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileInfo();
  }, [moduleId, dayIndex]);

  const handleRotate = () => {
    setRotation(prev => prev + 90);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fileUrl);
      notification.success({ message: 'File link copied to clipboard!' });
    } catch (err) {
      notification.error({ message: 'Failed to copy file link.' });
    }
  };

  const isImage = fileType?.startsWith('image/');
  const isPDF = fileType === 'application/pdf';
  const isDocOrExcel = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(fileType);

  return (
    <div className="preview-container-unique">
    
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : (
        <>
          {isImage && (
            <>
              <div >
                <button className="preview-rotate-btn" onClick={handleRotate}>
                  <FontAwesomeIcon icon={faRedo} /> 
                </button>
                <button className="preview-copy-btn" onClick={handleCopy}>
                  <FontAwesomeIcon icon={faCopy} /> 
                </button>
              </div>
              <br></br>
             <div className="p-5 m-5">
             <img
                ref={imageRef}
                src={fileUrl}
                alt="preview"
                className="preview-image"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
             </div>
            </>
          )}

          {isPDF && (
            <iframe
              src={fileUrl}
              title="PDF Preview"
              className="preview-pdf-frame"
            />
          )}

          {isDocOrExcel && (
            <p>
              This document type cannot be previewed here.{' '}
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                Open in new tab
              </a>
            </p>
          )}

          {!isImage && !isPDF && !isDocOrExcel && (
            <p>
              This file type cannot be previewed.{' '}
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                Open in new tab
              </a>
            </p>
          )}
        </>
      )}
      <style>{`

      /* FilePreview Component */
.preview-container-unique {
  padding: 20px 300px;
  font-family: 'Segoe UI', sans-serif;
  position: relative;
  max-width: 100%;
  overflow-y: auto;
  height:100vh;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
}

.preview-container-unique:hover {
  transform: scale(1.02);
}

.preview-back-button {
  margin-bottom: 15px;
  padding: 10px 18px;
  border: 1px solid #aaa;
  background: #fff;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

.preview-back-button:hover {
  background-color: #f1f1f1;
  transform: translateY(-2px);
}

.preview-rotate-btn, .preview-copy-btn {
  margin-right: 10px;
  padding: 10px 18px;
  border: none;
  border-radius: 5px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.3s, background 0.3s;
}

.preview-rotate-btn {
  background: #0dcaf0;
}

.preview-copy-btn {
  background: #6c757d;
}

.preview-rotate-btn:hover, .preview-copy-btn:hover {
  transform: translateY(-2px);
}

.preview-image {
  transform: rotate(0deg);
  max-width: 100%;
  max-height: 80vh;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  transition: all 0.5s ease-in-out;
}

.preview-pdf-frame {
  width: 100%;
  height: 600px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
}

.preview-pdf-frame:hover {
  transform: scale(1.05);
}

a {
  color: #0d6efd;
  text-decoration: underline;
  transition: color 0.3s;
}

a:hover {
  color: #0056b3;
}

/* Loading Animation */
.loading-spinner {
  display: block;
  margin: 0 auto;
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

      `
      }</style>
    </div>
  );
};

export default FilePreview;
