// routes/task.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const Data = require('../models/Data');
const Task = require('../models/Task');
const upload = require('../middleware/uploads');
const mime = require('mime-types');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure you have an auth middleware



const router = express.Router();


// Ensure the uploads folder exists
const uploadDirectory = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});



// Create transporter object using nodemailer for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


//fetch the task based on the team-lead T_id
router.get("/tasks", authMiddleware, async (req, res) => {
  try {
      // Only allow team leads
      if (req.user.role !== "team-lead") {
          return res.status(403).json({ error: "Access denied. Only team leads can fetch tasks." });
      }
    //  console.log("id:",req.user.id)
     const task = await User.findById(req.user.id)
     const data=task.team_id
    //  console.log("T_id:",data)
      const tasks = await Task.find({team_id:data});
      res.json(tasks);
  } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
  }
});


const sendTaskEmail = async ({ taskName, assignEmail, startDate, endDate, taskFile, team_id, moduleId, req }, retries = 3) => {
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(taskFile)}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: assignEmail,
        subject: 'New Task Assigned',
        html: `
            <div style="font-family: Arial; max-width: 600px; padding: 20px; border: 1px solid #ddd;">
                <h2 style="color: #4CAF50;">New Task Assigned</h2>
                <p>You have been assigned a new task. Please find the details below:</p>
                <p><strong>Task Name:</strong> ${taskName}</p>
                <p><strong>Email:</strong> ${assignEmail}</p>
                <p><strong>Module ID:</strong> ${moduleId}</p>  <!-- New Module ID field in email -->
                <p><strong>Start Date:</strong> ${startDate}</p>
                <p><strong>End Date:</strong> ${endDate}</p>
                <p><strong>ID:</strong> ${team_id}</p>
                <p>You can download the task file <a href="${fileUrl}">here</a>.</p>
                <p>Best regards,<br>Team Management System</p>
            </div>
        `,
        attachments: taskFile ? [{ filename: path.basename(taskFile), path: taskFile }] : []
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', assignEmail);
    } catch (error) {
        console.error('Error sending email:', error);
        if (retries > 0 && error.code === 'ECONNRESET') {
            console.log(`Retrying... Attempts left: ${retries - 1}`);
            await new Promise(res => setTimeout(res, 2000));
            return sendTaskEmail({ taskName, assignEmail, startDate, endDate, taskFile, team_id, moduleId, req }, retries - 1);
        }
    }
};

router.post('/tasks', authMiddleware, upload.single('taskFile'), async (req, res) => {
  const {assignEmail, taskName, startDate, endDate, moduleId } = req.body;
  const taskFile = req.file ? req.file.path : null;

  try {
     

      // Find the logged-in user in the database
      const user = await User.findById(req.user.id);  // Fix: Use findById

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // console.log("User found:", user);

      // Get T_id from the user
      const team_id = user.team_id;
      // console.log("User T_id:", team_id);

      // Check for missing taskFile
      if (!taskFile) {
          return res.status(400).json({ error: 'Task file is required' });
      }

      // Create a new task with T_id
      const newTask = new Task({ taskName, startDate, endDate, taskFile, team_id, moduleId,assignEmail });
      await newTask.save();

      res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (err) {
      console.error("Error creating task:", err);
      res.status(500).json({ error: 'Error creating task', details: err.message });
  }
});

// Get logged-in user's details
router.get('/logged-user',authMiddleware, async (req, res) => {
  try {
      const userId = req.user.id; // Extract user ID from the token
      const user = await User.findById(userId).select('name email'); // Fetch name & email

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      res.json({ name: user.name, email: user.email });
  } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


// Fetch task based on email (assignEmail in the database)
router.get('/tasks',authMiddleware, async (req, res) => {
   
    // console.log( req.user.email," :email ")

    try {
        // Find the task by assigned email (assignEmail)
        const task = await Task.find({ assignEmail: req.user.email });

        // If no task is found, return a 404 error
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // If the task is found, return it
        res.status(200).json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/task',authMiddleware, async (req, res) => {
  
  // console.log( req.user.email," :email ")
  try {
      // Find the task by assigned email (assignEmail)
      const task = await Task.find({ assignEmail: req.user.email});

      // If no task is found, return a 404 error
      if (!task) {
          return res.status(404).json({ message: 'Task not found' });
      }

      // If the task is found, return it
      res.status(200).json(task);
  } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Route to fetch task details by moduleID
router.get('/tasks/:moduleID', async (req, res) => {
  const { moduleID } = req.params; // Extract moduleID from URL parameter

  try {
    // Find the task by moduleID
    const task = await Task.findOne({ moduleId: moduleID });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Return the task data
    res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



//   const { email } = req.params;

//   try {
//     // Find the task by moduleId
//     const task = await Task.findOne({ assignEmail:email });

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     // Count the number of submissions
//     const submissionCount = task.submissions.length;

//     res.status(200).json({ count: submissionCount });
//   } catch (error) {
//     console.error('Error fetching submission count:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// router.post('/data', upload.single('file'), async (req, res) => {
//   const { moduleId, dayIndex } = req.body;

//   if (!req.file) {
//     return res.status(400).send('No file uploaded');
//   }

//   try {
//     const newData = new Data({
//       moduleId,
//       dayIndex,
//       fileUrl: req.file.path // Save the file path
//     });

//     await newData.save();

//     res.status(200).send('File uploaded and data saved successfully');
//   } catch (error) {
//     console.error('Error saving data:', error);
//     res.status(500).send('Failed to save data');
//   }
// });


// router.post('/data', upload.single('file'), async (req, res) => {
//   const { moduleId, dayIndex, assignEmail } = req.body;

//   if (!req.file) {
//     return res.status(400).send('No file uploaded');
//   }

//   try {
//     // Save submission to the data collection
//     const newData = new Data({
//       moduleId,
//       assignEmail,
//       dayIndex,
//       fileUrl: req.file.path // Save the file path
//     });

//     await newData.save();

//     // Update the task with the new submission
//     const task = await Task.findOne({ moduleId, assignEmail });
//     if (task) {
//       task.submissions.push({
//         filePath: req.file.path,
//         assignedEmail: assignEmail,
//         day: `Day-${dayIndex}`,
//       });
//       await task.save();
//     }

//     res.status(200).send('File uploaded and data saved successfully');
//   } catch (error) {
//     console.error('Error saving data:', error);
//     res.status(500).send('Failed to save data');
//   }
// });

// POST endpoint for submitting a task

// Get task by moduleId
router.get('/task-modules/:moduleId', async (req, res) => {
  try {
      const { moduleId } = req.params;

      // Find the task by moduleId
      const task = await Task.findOne({ moduleId });

      if (!task) {
          return res.status(404).json({ message: 'Task not found' });
      }
      
      res.json(task);
  } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/submit-task', upload.single('file'), async (req, res) => {
  try {
    // Extract data from the request body
    const { moduleId, assignEmail, dayIndex } = req.body;

    // Ensure a file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }
    
    const fileUrl = req.file.path; // Get the file path from multer

    // Validate input data
    if (!moduleId || !assignEmail || !dayIndex) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Fetch task details
    const taskData = await Task.findOne({ assignEmail });

    if (!taskData) {
      return res.status(404).json({ message: 'Task not found for the given email' });
    }

    const team_id = taskData.team_id;  // Extract T_id from the found task

    // Step 1: Save the data into the Data collection
    const newData = new Data({
      moduleId,
      assignEmail,
      dayIndex,
      fileUrl,
      team_id
    });

    await newData.save();

    // Step 2: Update the Tasks collection
    const submission = {
      filePath: fileUrl,
      assignedEmail: assignEmail,
      day: dayIndex.toString(), // Convert to string if necessary
    };

    const task = await Task.findOne({ moduleId, assignEmail });

    if (!task) {
      return res.status(404).json({ message: 'No matching task found' });
    }

    const result = await Task.updateOne(
      { moduleId, assignEmail },
      { $push: { submissions: submission } }
    );

    if (result.matchedCount === 0) {
      console.error('No matching document found');
    }

    // Step 3: Respond with success message
    return res.status(200).json({ message: 'Task submitted successfully' });

  } catch (error) {
    console.error('Error in /submit-task:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/data/:moduleId/count', async (req, res) => {
  try {
    const { moduleId } = req.params;
    // console.log(moduleId)

    // Validate input
    if (!moduleId) {
      return res.status(400).json({ message: 'Module ID is required' });
    }

    // Find the task document by moduleId and get the count of submissions
    const task = await Task.findOne({ moduleId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found for the given module ID' });
    }

    // Get the count of submissions
    const submissionsCount = task.submissions.length;
    // console.log(submissionsCount)

    // Respond with the count
    res.status(200).json({ count: submissionsCount });

  } catch (error) {
    console.error('Error fetching submissions count:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE route to delete a task by ID (use the correct field, e.g., _id)
router.delete('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params; // Extract taskId from URL parameter

  try {
    // Find and delete the task by _id
    const deletedTask = await Task.findByIdAndDelete(taskId);

    // If no task is found, return a 404 error
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Return a success message
    res.status(200).json({ message: 'Task deleted successfully', deletedTask });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/files/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Validate moduleId
    if (!moduleId) {
      return res.status(400).json({ message: 'Module ID is required' });
    }

    // Fetch files from the database by moduleId
    const files = await Data.find({ moduleId }).select('dayIndex fileUrl -_id'); // Only include dayIndex and fileUrl fields

    if (files.length === 0) {
      return res.status(404).json({ message: 'No files found for the given Module ID' });
    }

    // Respond with the file data
    return res.status(200).json({
      success: true,
      message: 'Files retrieved successfully',
      files,
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

router.get('/download-file/:moduleId/:dayIndex', async (req, res) => {
  try {
    const { moduleId, dayIndex } = req.params;

    console.log(`Downloading file for Module ID: ${moduleId}, Day Index: ${dayIndex}`);

    // Fetch the file record from MongoDB
    const file = await Data.findOne({ moduleId, dayIndex });

    if (!file) {
      console.error('File record not found in database');
      return res.status(404).json({ message: 'File not found in database' });
    }

    // If file is stored in an external URL, redirect the user
    if (file.fileUrl.startsWith('http')) {
      console.log('File is stored on an external server, redirecting...');
      return res.redirect(file.fileUrl);
    }

    // Construct the absolute file path
    const filePath = path.join(__dirname, '..', 'uploads', path.basename(file.fileUrl));


    // console.log(`File path resolved: ${filePath}`);

    // Check if the file actually exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found on server:', filePath);
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Determine MIME type
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    console.log(`MIME Type detected: ${mimeType}`);

    // Set headers to ensure the correct file is downloaded
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);

    // Send the file for download
    return res.download(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res.status(500).json({ message: 'Error downloading file' });
      }
    });
  } catch (error) {
    console.error('Error fetching file for download:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});




module.exports = router;
