// server.js
const express = require('express');
const connectDB = require('./db');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');  // Authentication routes
const taskRoutes = require('./routes/task');  // Task routes
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const Data = require('./models/Data'); // Import your Data model
const messageRoutes = require('./routes/messageRoutes');
const http = require('http');
const { Server } = require('socket.io');
const authMiddleware = require('./middleware/authMiddleware');
const Message = require('./models/Message'); // Import the Message model



dotenv.config();  // Load environment variables

const app = express();

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(express.json());  // Parse JSON bodies
app.use(cors({
  origin: 'http://localhost:3000',  // Allow requests from your frontend
  methods: ['GET', 'POST', 'DELETE','UPDATE','PUT'],  // Allow GET, POST, DELETE methods
  credentials: true  // Allow credentials (cookies, authorization headers, etc.)
}));

const server = http.createServer(app);
const io = new Server(server, { cors: {  origin: "http://localhost:3000", // Adjust for frontend
  methods: ["GET", "POST",'DELETE','UPDATE'], } });

// Route setup
app.use('/auth', authRoutes);  // Authentication routes
app.use('/api', taskRoutes);   // Task routes
app.use('/api/messages', messageRoutes);




// 🔥 SERVER SIDE
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // ✅ Listen for a custom event to join room
      socket.on('join', (userId) => {
        socket.join(userId); // join a room with user's ID
        console.log(`User ${userId} joined room`);
      });

      
    socket.on('join room', (roomId) => {
      socket.join(roomId)
      console.log("user joined room:", roomId)
  })
      socket.on("typing", (roomId) => {
        console.log(roomId)
        socket.to(roomId).emit('typing')
    })
    socket.on("stop typing", (roomId) => {
      socket.to(roomId).emit("stop typing")
  })
  

  socket.on('newMessage', (newMessageRecieved) => {
    var chat = newMessageRecieved.chat
    if (!chat.users) return console.log('no users found in the chat')

    chat.users.forEach(user => {
        if (user._id.toString() == newMessageRecieved.sender._id) return
        socket.to(user._id).emit('messageReceived', newMessageRecieved)
        // console.log("message sent")
    })
})

      socket.on('sendMessage', async (data) => {
        try {
          const newMessage = new Message(data);
          const savedMessage = await newMessage.save();

          // ✅ Send to both sender and receiver rooms
          io.to(data.receiver).emit('receiveMessage', savedMessage);
          io.to(data.sender).emit('receiveMessage', savedMessage);
        } catch (err) {
          console.error("Message save error:", err);
        }
      });


      socket.emit("me", socket.id)

      socket.on("callUser", (data) => {
          io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
      })
  
      socket.on("answerCall", (data) => {
          io.to(data.to).emit("callAccepted", data.signal)
      })
  

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });


});



// Serve uploaded files from the "uploads" folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/api/view-file/:moduleId/:dayIndex', async (req, res) => {
  const { moduleId, dayIndex } = req.params;

  try {
    // Query the database for the file using moduleId and dayIndex
    const fileRecord = await Data.findOne({ moduleId, dayIndex });

    if (!fileRecord) {
      // console.log(`File not found in database for moduleId: ${moduleId} and dayIndex: ${dayIndex}`);
      return res.status(404).json({ message: 'File not found in database' });
    }

    const fileUrl = fileRecord.fileUrl; // Only the file name, not the full path

    // Construct the correct file path
    const filePath = path.join(__dirname, fileUrl);  // Correctly join the path

    // console.log('File Path:', filePath); // Log the constructed file path to check

    // Check if the file exists in the uploads directory
    if (!fs.existsSync(filePath)) {
      // console.log(`File does not exist on server: ${filePath}`);
      return res.status(404).json({ message: 'File does not exist on server' });
    }

    const fileMimeType = mime.lookup(filePath); // Determine the MIME type based on the file extension

    // Set headers for content type and content disposition (for inline viewing)
    res.setHeader('Content-Type', fileMimeType);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);

    // Send the file as the response
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res.status(500).json({ message: 'Error sending file' });
      }
    });
  } catch (err) {
    console.error('Error fetching file from database:', err);
    res.status(500).json({ message: 'Error fetching file from database' });
  }
});








// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
