import React, { useState,useEffect,useRef } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaEllipsisV } from 'react-icons/fa';
// import { v4 as uuidv4 } from 'uuid';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faCheck, } from '@fortawesome/free-solid-svg-icons';
// import { notification } from 'antd';

// faCamera, faArrowLeft, faTrash, faLock, faEye, faEyeSlash  faPen,

const Messages = ({ messages, setMessages }) => {
    const bottomRef = useRef(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editedMessages, setEditedMessages] = useState({});
    

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

   useEffect(() => {
    return () => {
        return () => {
    document.removeEventListener('click', closeMenu);
    setEditingMessageId(null);
   
    setEditedMessages({});
    setOpenMenuId(null);
}
    }
}, [messages])

    const deleteMessage = async (messageId) => {
        try {
            const token = localStorage.getItem('userToken');
            // console.log("Token:", token); // ✅ Add this to debug
    
            await axios.delete(
                `${process.env.REACT_APP_URL}/api/messages/${messageId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
    
            setMessages(messages.filter(msg => msg._id !== messageId));
            // console.log("deletedid:",messages)
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };
    
    
    const editMessage = (msg) => {
        // console.log("msg._id:",msg._id)
       setEditingMessageId(msg._id);
       setEditedMessages((prevMessages) => ({ ...prevMessages, [msg._id]: msg.message }));
        setOpenMenuId(null);
    };
    
    const saveEditedMessage = async (messageId) => {
        const updatedMessage = editedMessages[messageId];
    
        try {
            const token = localStorage.getItem('userToken');
            await axios.put(`${process.env.REACT_APP_URL}/api/messages/messages/${messageId}`,
                { newMessage: updatedMessage, edited: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg._id === messageId ? { ...msg, message: updatedMessage, edited: true } : msg
                )
            );
    
            setEditingMessageId(null);
            setOpenMenuId(null);
        } catch (error) {
            console.error('Error updating message:', error);
        }
    };

    const closeMenu = (e) => {
        if (!e.target.closest('.menu-container')) {
            setOpenMenuId(null);
        }
    };

    useEffect(() => {
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);
    
    
    const toggleMenu = (messageId) => {
        setOpenMenuId(openMenuId === messageId ? null : messageId);
    };

    useEffect(() => {
        const messagesDiv = document.querySelector('.messages');
        if (messagesDiv) {
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
      }, [messages]);



      const currentDate = new Date();

      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      const formattedHours = hours % 12 || 12; // convert 0 to 12
      const formattedMinutes = minutes.toString().padStart(2, '0');
      
      const timeString = `${formattedHours}:${formattedMinutes} ${ampm}`;

    return (
        <div className="messages">
        <center className='text-secondary'>
          <i>Your messages are end-to-end encrypted🔒, Not accessible to anyone. Your conversation is private.</i>
        </center> 
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg._id} className={msg.sender === localStorage.getItem('loggedInUserId') ? 'sent' : 'received'}>
              {editingMessageId === msg._id && msg.sender === localStorage.getItem('loggedInUserId') ? (
                <>
                  <textarea
                    style={{
                      resize: 'none',
                      overflow: 'hidden',
                      borderRadius: '20px',
                      padding: '10px 15px',
                      fontSize: '14px',
                      maxHeight: '150px',
                      border: '1px solid #ccc',
                      outline: 'none',
                      backgroundColor: '#f0f0f0',
                      overflowY: 'scroll',
                      height:'250px',
                      width:"300px"
                    
                  
                    }}
                    className="edit-textarea"
                    rows={1}
                    value={editedMessages[msg._id]}
                    onChange={(e) =>
                      setEditedMessages((prevMessages) => ({
                        ...prevMessages,
                        [msg._id]: e.target.value,
                      }))
                    }
                    onInput={(e) => {
                      e.target.style.height = '150px';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    placeholder="Edit your message..."
                  />
                  <button
                    className='bg-success rounded text-white px-1 m-1 border'
                    onClick={() => saveEditedMessage(msg._id)}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                </>
              ) : (
                <>
                  {/* ✅ Render message text if present */}
                  {msg.message && <span>{msg.message}</span>}
      
                  {/* ✅ Render file preview or download if present */}
                  {msg.files && (
                    <div style={{ marginTop: '8px' }}>
                      {(msg.files.endsWith('.jpg') || msg.files.endsWith('.png')) ? (
                        <img
                          src={`${process.env.REACT_APP_URL}/api/messages/files/${msg.files}`}
                          alt="Uploaded"
                          style={{ maxWidth: '300px', borderRadius: '10px' }}
                        />
                      ) : (
                        <a
                          href={`${process.env.REACT_APP_URL}/api/messages/files/${msg.files}`}
                          download
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download File
                        </a>
                      )}
                    </div>
                  )}
      
                  {/* ✅ Edited badge */}
                  {msg.edited && (
                    <span style={{ fontSize: '10px', marginLeft: '5px', fontStyle: 'italic' }}>
                      <i className='text-dark'>(edited)</i>
                    </span>
                  )}
      
                  <br />
      
                  {/* ✅ Timestamp */}
                  <span className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString('en-GB', {hour: '2-digit',minute: '2-digit', hour12: true})} |
                    {new Date(msg.timestamp).toLocaleDateString('en-GB')}
                  </span>
      
                  {/* ✅ Read status */}
                  <span className={`tick ${msg.isRead ? 'double-tick' : 'single-tick'}`}>
                    {msg.isRead ? '✔✔' : '✔'}
                  </span>
      
                  {/* ✅ Edit/Delete menu */}
                  {msg.sender === localStorage.getItem('loggedInUserId') && (
                    <div className="menu-container">
                      <FaEllipsisV className='menu-icon' onClick={() => toggleMenu(msg._id)} />
                      {openMenuId === msg._id && (
                        <div className="dropdown-menu">
                          <button onClick={() => editMessage(msg)}><FaEdit /> Edit</button>
                          <button onClick={() => deleteMessage(msg._id)}><FaTrash /> Delete</button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <center className='text-secondary'>
            <i>Your messages are end-to-end encrypted🔒, Not accessible to anyone. Your conversation is private.</i>
          </center>
        )}

         <style>
                    { 
                        `
                    .text-secondary {
                        font-size: 10px;
                    }

                    .messages {
                        flex: 2;
                        padding: 15px;
                        overflow-y: auto;
                        margin: 5px;
                        font-size: 14px;
                        border-radius: 5px;
                        background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("https://wallpapercave.com/wp/wp9346845.jpg");
                        background-size: cover;
                        background-position: center;
                        display: flex;
                        flex-direction: column;
                        max-height: 80vh;
                        height: auto;
                    }

                    /* Hide scrollbars for all browsers */
                    .messages::-webkit-scrollbar {
                        display: none;
                    }
                    .messages {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                    .edit-textarea{
                     -ms-overflow-style: none;
                        scrollbar-width: none;
                    }

                    .sent, .received {
                        position: relative;
                        padding: 10px 14px;
                        border-radius: 15px;
                        margin: 6px 10px;
                        max-width: 70%;
                        word-wrap: break-word;
                        white-space: pre-wrap;
                        line-height: 1.4;
                        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
                    }

                    .sent {
                        background-color: #d1f7c4;
                        align-self: flex-end;
                        text-align: left;
                        color: #000;
                    }

                    .received {
                        background-color: #fff;
                        align-self: flex-start;
                        text-align: left;
                        color: #000;
                    }

                    .timestamp {
                        font-size: 10px;
                        color: #555;
                        margin-top: 5px;
                        display: inline-block;
                    }

                    .tick {
                        font-size: 14px;
                        margin-left: 5px;
                    }

                    .single-tick {
                        color: #555;
                    }
                    .double-tick {
                        color: blue;
                    }

                    .menu-container {
                        position: relative;
                        display: inline-block;
                        margin-left: 10px;
                    }

                    .menu-icon {
                        cursor: pointer;
                        float: right;
                        margin-left: 10px;
                    }

                    .dropdown-menu {
                        position: absolute;
                        right: 0;
                        top: 20px;
                        background: white;
                        box-shadow: 0px 4px 8px rgba(0,0,0,0.2);
                        border-radius: 5px;
                        display: flex;
                        flex-direction: column;
                        z-index: 10;
                        background: #444;
                        color: white;
                    }

                    .dropdown-menu button {
                        padding: 6px 12px;
                        background: none;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        color: white;
                        width: 100%;
                        text-align: left;
                    }

                    .dropdown-menu button:hover {
                        background: rgba(185, 191, 185, 0.51);
                    }

                    /* Textarea for editing */
                    input[type="text"] {
                        width: 100%;
                        padding: 6px;
                        border-radius: 8px;
                        border: 1px solid #ccc;
                        outline: none;
                        resize: vertical;
                        min-height: 30px;
                        max-height: 120px;
                        overflow-y: auto;
                        font-size: 14px;
                    }
                    `}
                </style>
      </div>
      
    );
};

export default Messages;

