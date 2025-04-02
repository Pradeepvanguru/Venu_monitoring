import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPaperPlane, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const socket = io(process.env.REACT_APP_SERVER_URL);
// toast.configure();

const ChatPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userName,setUserName]=useState("")
    const navigate = useNavigate();

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
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const response = await axios.get(`${process.env.REACT_APP_URL}/api/messages/messages/${selectedUser._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
    
                setMessages(response.data.messages || []);  // ✅ Ensure messages is always an array
                setUserName(response.data.user?.name || "Unknown User"); // ✅ Handle missing user data
    
            } catch (error) {
                console.error("Error fetching messages:", error);
                setMessages([]); // ✅ Set messages to empty array on error
            }
        };
        fetchMessages();
    }, [selectedUser]);
    

    useEffect(() => {
        socket.on('receiveMessage', (data) => {
            if (data.receiver === selectedUser?._id || data.sender === selectedUser?._id) {
                setMessages((prev) => [...prev, data]);
                toast.info(`New message from ${selectedUser?.name}`);
            }
        });
        return () => socket.off('receiveMessage');
    }, [selectedUser]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        const token = localStorage.getItem('userToken');
        const response = await axios.post(
            `${process.env.REACT_APP_URL}/api/messages/send`,
            { receiver: selectedUser._id, message: newMessage },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
            const messageData = { sender: "me", message: newMessage };
            setMessages([...messages, messageData]);
            socket.emit('sendMessage', messageData);
            setNewMessage('');
        }
    }

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
  

                {users.map((user) => (
                    <div key={user._id} className="user-item" onClick={() => setSelectedUser(user)}>
                        <FaUser className="user-icon" /> {user.name} ({user.role}) 
                    </div>
                ))}
            </div>
        <div className="chat-box"> 
             <div className="chat-header p-3 bg-black m-1 rounded text-white  ">
            <FaUser className="user-icon mx-2" />{selectedUser ? ` ${userName}` : "No user"}
            </div>
    
        <div className="messages">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
                <p key={index} className={msg.sender === "me" ? "sent" : "received"}>
                    {msg.message}
                </p>
            ))
            ) : (
                <center className='text-white'><i>No messages found...</i></center> // ✅ Handle empty messages
            )}
       </div>

        <div className="input-container">
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
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
                    background:rgb(37, 38, 40);
                    padding: 40px 20px 10px;
                    gap: 10px;
                }
                .user-list {
                    width: 30%;
                    background:rgba(246, 248, 244, 0.65);
                    border-radius: 8px;
                    padding: 10px;
                    overflow-y: auto;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .user-item {
                    margin-top:15px;
                    padding: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: 0.3s;
                    border:1px solid black;
                    border-radius:0.7rem;
                    
                }
                .user-item:active {
                    background:rgb(239, 237, 235);
                }
                .user-item:hover{
                    box-shadow: 0 4px 6px rgb(247, 242, 242);
                }
                .chat-box {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background:rgba(195, 199, 193, 0.45);
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .messages {
                    flex: 1;
                    padding: 15px;
                    overflow-y: auto;
                    margin:20px;
                    
                    
                }
                .sent {
                    text-align: right;
                    color: white;
                    background:rgb(107, 156, 209);
                    padding: 10px;
                    border-radius: 15px;
                    margin: 5px 0;
                   
                }
                .received {
                    text-align: left;
                    color: black;
                    background:rgb(179, 183, 186);
                    padding: 10px;
                    border-radius: 15px;
                    margin: 5px 0;
                    
                }
                .input-container {
                    display: flex;
                    padding: 10px;
                    background:rgb(76, 78, 80);
                    border-top: 1px solid #ddd;
                   
                }
                input {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 5px;
                    background:rgb(76, 78, 80);

                }
                .send-btn {
                    background:rgba(11, 110, 216, 0.97);
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: 0.3s;
                }
                .send-btn:hover {
                    background:hsl(120, 0.50%, 62.90%);
                }
                @media (max-width: 768px) {
                    .chat-container {
                        flex-direction: column;
                    }
                    .user-list {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default ChatPage;
