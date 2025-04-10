import React, { useEffect, useState,useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPaperPlane, FaUser,FaPaperclip } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Messages from './messages';
import {notification} from 'antd'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip } from 'react-tooltip';




const ChatPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userName,setUserName]=useState("")
    const socket = io(process.env.REACT_APP_SERVER_URL);
    const navigate = useNavigate();
    const textareaRef = useRef(null);
    const [files,setFile]=useState(null)
    const [fileName,setfileName]=useState(null)
    const [searchQuery, setSearchQuery] = useState("");
    // const intervalRef = useRef(null);
    // const timeoutRef = useRef(null);

    const notify = () => {
    toast.success("Message sent!");
  };
     const handleInput = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
        setNewMessage(e.target.value);
    };


    useEffect(() => {
            const fetchUsers = async () => {
                try {
                    const token = localStorage.getItem('userToken');
                    const data_id = localStorage.getItem('team_id');
                    const email = localStorage.getItem("loggedInEmail");

                    const response = await axios.get(`${process.env.REACT_APP_URL}/api/messages/chat-list`, {
                        headers: { "Authorization": `Bearer ${token}` },
                        params: { team_id: data_id, email: email }
                    });

                    if (response.data.length === 0) {
                        notification.info({messages:'No teammates found for the given team ID.'});
                        // You can also show a message to the user here
                    }

                    setUsers(response.data);
                } catch (error) {
                    console.error('Error fetching teammates:', error.message);
                 notification.info({ message: 'No Teammates found for Your teamID.' || error.message});
                    // Optional: Set an error state or show a toast
                    setUsers([]); // fallback to empty list
                }
            };

            fetchUsers();
     }, []);


    useEffect(() => {
        if (!selectedUser) return;
        fetchMessages(); // Initial fetch when selectedUser changes
    }, [selectedUser]);
    
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         if (selectedUser) {
    //             fetchMessages();
    //         }
    //     }, 100); // Refresh every 10 seconds
    
    //     return () => clearInterval(interval); // Cleanup on unmount
    // }, [selectedUser]); // Depend on selectedUser so it updates when user changes
    
    // ⬇️ Define fetchMessages outside the useEffect so both can use it
    
    
//   useEffect(() => {
//     return () => {
//         if (intervalRef.current) clearInterval(intervalRef.current);
//         if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     };
// }, []);

   
    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await axios.get(`${process.env.REACT_APP_URL}/api/messages/messages/${selectedUser._id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
    
            setMessages(response.data.messages || []);
            setUserName(response.data.user?.name || "Unknown User");
            localStorage.setItem("loggedInUserId", response.data.client);
        } catch (error) {
            console.error("Error fetching messages:", error);
            setMessages([]);
        }
    };

    

    const sendMessage = async () => {
        if (!selectedUser) {
            notification.info({ message: "Please select a user to send a message" });
            return;
        }
    
        const token = localStorage.getItem('userToken');
        const senderId = localStorage.getItem("loggedInUserId");
    
        const formData = new FormData();
        formData.append("receiver", selectedUser._id);
        formData.append("message", newMessage);
        if (files) {
            formData.append("files", files);
        }
    
        try {
            const response = await axios.post(`${process.env.REACT_APP_URL}/api/messages/send`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
    
            if (response.data.success) {
                const messageData = {
                    sender: senderId,
                    message: newMessage,
                    timestamp: new Date().getTime(),
                    receiver: selectedUser._id,
                    _id: response.data.msgid,
                    files: response.data.message.files // Optional, for displaying
                };
    
                setMessages([...messages, messageData]);
                socket.emit('sendMessage', messageData);
    
                if (textareaRef.current) {
                    textareaRef.current.style.height = '40px';
                }
    
                setNewMessage('');
                setFile(null); 
                setfileName(null)
                notify();
            }
        } catch (err) {
            console.error("Error sending message:", err);
            toast.error("Failed to send message");
        }
    };
    
    

     useEffect(() => {
        const socket = io("http://localhost:5000");
        if (!socket) return;
    
        const handleReceiveMessage = (data) => {
            if (data.receiver === selectedUser?._id || data.sender === selectedUser?._id) {
                setMessages((prev) => [...prev, data]);
            }
        };
    
        socket.on('receiveMessage', handleReceiveMessage);
    
        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [selectedUser]);  // Removed `socket` from dependency list

    
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
           setFile(file)
           setfileName(file.name)
           
        }
        
    };

   
   // Filter users inline during rendering
const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
    

    return (
        <div className="chat-container">
            <button onClick={() => navigate(-1)}  style={{ 
                    backgroundColor: "transparent", 
                    color: "white", 
                    padding: "1px ", 
                    border: "1px solid", 
                    borderRadius: "5rem", 
                    cursor: "pointer", 
                    width:'100px',
                    height:'30px',
                    zIndex:'100',
                    top:'5px',
                    position:'fixed',
                    marginLeft:'-10px',
                    boxShadow:'-moz-initial'
                    
                }}> &lt; Back</button>
                
                <div className="user-list">
  <ToastContainer position="top-right" autoClose={3000} />
  
  <div style={{ position: "relative", width: "250px" }}>
    <input
      type="search"
      placeholder="Search here..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{
                    width: "auto",
                    padding: "10px 40px 10px 25px",
                    fontSize: "16px",
                    border: "1px linear #ccc",
                    borderRadius: "10px",
                    outline: "none",
                    display:'flex',
                    transition: "0.3s ease-in-out",
                    }}
    />
    <i
       className="fa fa-search"
       style={{
        position: "absolute",
        right: "4px",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "20px",
        color: "#666fff",
        cursor: "pointer",
        transition: "0.3s ease-in-out",
      }}
    ></i>
  </div>

  {filteredUsers.length > 0 ? (
    filteredUsers.map((user) => (
      <div
        key={user._id}
        className="user-item"
        onClick={() => setSelectedUser(user)}
      >
        <FaUser className="user-icon" /> {user.name} ({user.role})
      </div>
    ))
  ) : (
    <center className="text-secondary m-5 shadow-sm">
      <i>No Teammates are found...!</i>
    </center>
  )}
</div>

            <div className="chat-box"> 
             <div className="chat-header p-3 bg-black m-1 rounded text-white  ">
            <FaUser className="user-icon mx-2" />{selectedUser ? ` ${userName}` : "No user"}
            </div>
    
            {/* <div className="messages">
            <center className='text-secondary'><i>Your messages are end-to-end encrypted🔒...!</i></center><br></br>
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <p key={index} className={msg.sender === localStorage.getItem("loggedInUserId") ? "sent" : "received"}>
                            {msg.message}
                        </p>
                    ))
                    ) : (
                        <center className='text-primary p-5'><i>{selectedUser ? `No messages with ${userName} yet...Your messages are end-to-end encrypted🔒` : 'Your messages are end-to-end encrypted🔒... No messages found...'}</i></center>
                    )}
                </div> */}

                <Messages messages={messages} setMessages={setMessages} selectedUser={selectedUser} />

                <div className="chat-input-container">
                    <div className="input-container">
                        <textarea
                        ref={textareaRef}
                        className="textarea-message"
                        rows={1}
                        value={newMessage}
                        onChange={handleInput}
                        placeholder={"Type a message..." || fileName}
                        onInput={handleInput}
                        />
                        <label htmlFor="file-upload" className="file-upload-icon">
                        <FaPaperclip size={20} />
                        </label>

                        <button onClick={sendMessage} className="send-btn">
                        <FaPaperPlane />
                        </button>

                        <div className="file-upload-container">
                        <label htmlFor="file-upload" className="file-upload-label">
                            {fileName && <button className="tick-icon rounded bg-secondary border-0 " onClick={()=>{setfileName(null)}}> ❌</button>}
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />
                        {fileName && (
                            <input
                            type="text"
                            className="file-name-display"
                            value={fileName}
                            disabled
                            style={{width:'300px',marginLeft:'5px',marginTop:'2px',color:"white", background:'rgba(3, 0, 13, 0.37)',borderRadius:'0rem 1rem 1rem .5rem',border:'none'}}
                            />
                        )}
                        </div>
                    </div>
                    </div>

        </div>

         <Tooltip anchorSelect='.file-upload-icon' place='top'>Attach file here..!</Tooltip>
        <style>{`
            .chat-container {
                display: flex;
                height: 100vh;
                background: rgb(37, 38, 40);
                padding: 40px 20px 10px;
                gap: 10px;
            }

            .user-list {
                width: 24%;
                background: rgba(246, 248, 244, 0.65);
                border-radius: 8px;
                padding: 10px;
                overflow-y: auto;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .user-item {
                margin-top: 15px;
                padding: 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: 0.3s;
                border: 1px solid black;
                border-radius: 0.7rem;
                background: rgb(239, 237, 235);
            }

            .user-item:active {
                background: rgb(239, 237, 235);
            }

            .user-item:hover {
                box-shadow: 0 4px 6px rgb(19, 19, 19);
            }

            .chat-box {
                flex: 1;
                display: flex;
                flex-direction: column;
                background: rgba(56, 64, 53, 0.35);
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .chat-input-container {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                padding: 5px 20px 0px 30px;
                background: rgba(249, 250, 251, 0.5);
                border-top: 1px solid #ddd;
              
            }

            .input-container {
                display: flex;
                flex-direction: row;
                align-items: center;
                width: 100%;
                gap: 10px;
            }

            .textarea-message {
                overflow: scroll;
                resize: none;
                height:40px;
                width: 45%;
                padding: 10px 20px;
                border-radius: 1.5rem;
                border: 1px solid #ccc;
                font-size: 14px;
                background-color:rgba(2, 8, 32, 0.85);
                color: #fff;
                outline: none;
                max-Height:150px;
               z-index:10001;
            }
             .textarea-message::-webkit-scrollbar {
                        display: none;
                    }

            .file-upload-icon {
                cursor: pointer;
                height: 40px;
                width: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                border:none;
                color:#33ff;
                margin-top:3px;
                margin-left:5px;
                
            }

            .send-btn {
                background-color: #007bff;
                border: none;
                height: 40px;
                width: 40px;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                cursor: pointer;
                transition: 0.3s;
                margin-left:-5px;
            }

            .send-btn:hover {
                background-color: #0056b3;
            }

            @media (max-width: 768px) {
                .chat-container {
                flex-direction: column;
                }

                .user-list {
                width: 100%;
                }

                .chat-input-container {
                flex-direction: column;
                }

                .input-container {
                flex-direction: column;
                align-items: stretch;
                }

            }
        `}</style>


        </div>
    );
};

export default ChatPage;
