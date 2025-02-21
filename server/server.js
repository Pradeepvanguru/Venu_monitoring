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

dotenv.config();  // Load environment variables

const app = express();

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(express.json());  // Parse JSON bodies
app.use(cors({
  origin: 'http://localhost:3000',  // Allow requests from your frontend
  methods: ['GET', 'POST', 'DELETE','UPDATE'],  // Allow GET, POST, DELETE methods
  credentials: true  // Allow credentials (cookies, authorization headers, etc.)
}));

// Route setup
app.use('/auth', authRoutes);  // Authentication routes
app.use('/api', taskRoutes);   // Task routes



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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
