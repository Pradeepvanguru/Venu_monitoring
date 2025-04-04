import React, { useEffect, useState,useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPaperPlane, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Messages from './messages';
import {notification} from 'antd'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




const ChatPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userName,setUserName]=useState("")
    const socket = io(process.env.REACT_APP_SERVER_URL);
    const navigate = useNavigate();
    // const intervalRef = useRef(null);
    // const timeoutRef = useRef(null);

    const notify = () => {
    toast.success("Message sent!");
  };

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('userToken');
            const data_id=localStorage.getItem('team_id')
            const email=localStorage.getItem("loggedInEmail")
            const response = await axios.get(`${process.env.REACT_APP_URL}/api/messages/chat-list`, {
                headers: { "Authorization": `Bearer ${token}` },
                params:{team_id:data_id,email:email}
            });
            setUsers(response.data);
            // console.log("data_m",response.data);
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
         notification.info({ message: "Please select the user to send message" });
          }  
          else {
         if (!newMessage.trim() || !selectedUser) return;
         const token = localStorage.getItem('userToken');
         const senderId = localStorage.getItem("loggedInUserId");
         const response = await axios.post(`${process.env.REACT_APP_URL}/api/messages/send`,
             { receiver: selectedUser._id, message: newMessage },
             { headers: { Authorization: `Bearer ${token}` } }
         );

         
         if (response.data.success) {
             const messageData = { sender: senderId, message: newMessage,timestamp: new Date().getTime(),receiver: selectedUser._id,_id:response.data.msgid};  // ✅ Store actual sender ID
             setMessages([...messages, messageData]);
             socket.emit('sendMessage', messageData);
             setNewMessage('');
             notify()
             
         }
        
     }}
    

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
            <div style={{ position: "relative", width: "250px",  }}>
                <input type="search" placeholder="Search here..."
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
                    right: "-1px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "20px",
                    color: "#666fff   ",
                    cursor: "pointer",
                    transition: "0.3s ease-in-out",
                    }}
                ></i>
                </div>
  
              {users.length> 0 ?(
                users.map((user) => (
                    <div key={user._id} className="user-item" onClick={() => setSelectedUser(user)}>
                        <FaUser className="user-icon" /> {user.name} ({user.role}) 
                    </div>
                ))

              ):(
                <center className='text-white'><i>No users found...</i></center>
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

                <div className="input-container">
                    <textarea
                        className="textarea-message"
                        rows={1}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                    />
                    <button onClick={sendMessage} className="send-btn">
                        <FaPaperPlane />
                    </button>
                </div>


        </div>


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

    .input-container {
        display: flex;
        align-items: flex-end;
        gap: 10px;
        padding: 10px;
        background: rgb(76, 78, 80);
        border-top: 1px solid #ddd;
    }

    .textarea-message {
        resize: none;
        overflow: hidden;
        border-radius: 20px;
        padding: 10px 15px;
        width: 100%;
        font-size: 14px;
        max-height: 150px;
        border: none;
        outline: none;
        background-color: #f0f0f0;
        color: #333;
    }

    .send-btn {
        background: rgba(11, 110, 216, 0.97);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 10px;
        cursor: pointer;
        transition: 0.3s;
    }

    .send-btn:hover {
        background: hsl(231, 77.80%, 15.90%);
    }

    @media (max-width: 768px) {
        .chat-container {
            flex-direction: column;
        }
        .user-list {
            width: 100%;
        }
        .input-container {
            flex-direction: column;
        }
    }
`}</style>

        </div>
    );
};

export default ChatPage;
