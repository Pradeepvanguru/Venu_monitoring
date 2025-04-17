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



const generateAccessKey = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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


//fetch the task based on the team-lead
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
  const { assignEmail, taskName, startDate, endDate,  moduleSummury } = req.body;
  const taskFile = req.file ? req.file.path : null;
 

  try {
      // Find the logged-in user
      const user = await User.findById(req.user.id);

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      const team_id = user.team_id;

      if (!taskFile) {
          return res.status(400).json({ error: 'Task file is required' });
      }

      // Parse the assignEmail string (which should be a JSON array)
      const parsedEmails = JSON.parse(assignEmail);

      if (!Array.isArray(parsedEmails) || parsedEmails.length === 0) {
          return res.status(400).json({ error: 'assignEmail must be a non-empty array' });
      }

      // Create task for each email
      const tasks = await Promise.all(parsedEmails.map(async (email) => {
        const ModuleId=generateAccessKey()
          const newTask = new Task({
              taskName,
              startDate,
              endDate,
              taskFile,
              team_id,
              moduleSummury,
              moduleId:ModuleId,
              assignEmail: email
          });
          return await newTask.save();
      }));

      res.status(201).json({ message: 'Tasks created successfully', tasks });

  } catch (err) {
      console.error("Error creating tasks:", err);
      res.status(500).json({ error: 'Error creating tasks', details: err.message });
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
    // DELETE Task Submission by dayIndex, assignEmail, and moduleId
router.delete('/delete-task', async (req, res) => {
  try {
    const { dayIndex, assignEmail, moduleId } = req.body;

    // Validate input data
    if (!dayIndex || !assignEmail || !moduleId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Find the task
    const task = await Task.findOne({ moduleId, assignEmail });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Check dayIndex validity
    if (dayIndex < 1 || dayIndex > task.submissions.length) {
      return res.status(400).json({ message: 'Invalid dayIndex.' });
    }

    // Get the submission to delete (before splicing)
    const deletedSubmission = task.submissions[dayIndex - 1];
    const fileName = deletedSubmission?.fileName; // Adjust if your object has a different key

    // Remove the submission
    task.submissions.splice(dayIndex - 1, 1);
    await task.save();

    // Delete from Data collection
    await Data.findOneAndDelete({ moduleId, assignEmail, dayIndex });

    // Delete file from uploads folder if fileName exists
    if (fileName) {
      const filePath = path.join(__dirname, '..', 'uploads', fileName);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err.message);
          // Don't return error here — file might already be gone
        }
      });
    }

    return res.status(200).json({ message: 'Submission and associated file deleted successfully.' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error while deleting submission.' });
  }
});







//submit task-----------------------------------------------------------------------------------------------------------------------


// router.delete('/clear-data', async (req, res) => {
//   const { teamId, moduleId, assignEmail } = req.body;

//   if (!teamId || !moduleId || !assignEmail) {
//     console.log(teamId,'id')
//     return res.status(400).json({ message: 'Missing teamId, moduleId, or assignEmail' });
//   }

//   try {
//     // Update Task: remove only matching submissions
//     await Task.updateMany(
//       {},
//       {
//         $pull: {
//           submissions: {
//             teamId,
//             moduleId,
//             assignEmail
//           }
//         }
//       }
//     );

//     // Delete Data documents matching the criteria
//     await Data.deleteMany({ teamId, moduleId, assignEmail });

//     // Path to the uploads directory
//     const uploadDir = path.join(__dirname, '..', 'uploads');

//     // Read all files in uploads directory
//     fs.readdir(uploadDir, (err, files) => {
//       if (err) {
//         console.error('Error reading uploads directory:', err);
//         return res.status(500).json({ message: 'Error reading uploads directory', error: err.message });
//       }

//       // Define a basic filename pattern (adjust based on your naming convention)
//       const matchString = `${teamId}_${moduleId}_${assignEmail}`.replace(/[@.]/g, '_');

//       // Delete matching files
//       for (const file of files) {
//         if (file.includes(matchString)) {
//           fs.unlink(path.join(uploadDir, file), err => {
//             if (err) console.error(`Error deleting file ${file}:`, err);
//           });
//         }
//       }
//     });

//     res.status(200).json({ message: 'Selected task submissions and files deleted.' });
//   } catch (error) {
//     console.error('Error clearing data:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });



router.post('/submit-task', upload.single('files'), async (req, res) => {
  try {
    const { moduleId, assignEmail, dayIndex } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const fileUrl = req.file.path;

    if (!moduleId || !assignEmail || !dayIndex) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Fetch task data
    const taskData = await Task.findOne({ assignEmail });

    if (!taskData) {
      return res.status(404).json({ message: 'Task not found for the given email' });
    }

    const team_id = taskData.team_id;

    // 🟡 Step 1: Upsert (update if exists, insert if not) into Data collection
    await Data.findOneAndUpdate(
      { moduleId, assignEmail, dayIndex },
      {
        moduleId,
        assignEmail,
        dayIndex,
        fileUrl,
        team_id
      },
      { upsert: true, new: true }
    );

    // 🟢 Step 2: Check if a submission already exists for this day in Task
    const task = await Task.findOne({ moduleId, assignEmail, 'submissions.day': dayIndex.toString() });

    if (task) {
      // Update existing submission
      await Task.updateOne(
        { moduleId, assignEmail, 'submissions.day': dayIndex.toString() },
        {
          $set: {
            'submissions.$.filePath': fileUrl,
            'submissions.$.action': 'pending'
          }
        }
      );
    } else {
      // Push new submission
      const submission = {
        filePath: fileUrl,
        assignedEmail: assignEmail,
        day: dayIndex.toString(),
        action: 'pending'
      };

      await Task.updateOne(
        { moduleId, assignEmail },
        { $push: { submissions: submission } }
      );
    }

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
    const NameID=task.team_id
    const userName = await User.findOne({ team_id: NameID,email:task.assignEmail });

    if (!task) {
      return res.status(404).json({ message: 'Task not found for the given module ID' });
    }

    // Get the count of submissions
    // const submissionsCount = task.submissions.length;
    // console.log(submissionsCount)

    const submissionsCount = await Data.countDocuments({
      moduleId,
      Actions: 'accept'
    });


    // Respond with the count
    res.status(200).json({ count: submissionsCount,userName});

  } catch (error) {
    console.error('Error fetching submissions count:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// DELETE route to delete a task by ID
router.delete('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;

  try {
    // Step 1: Find the task (to access teamId and moduleId)
    const task = await Task.findById(taskId);

    if (!task) {
      console.log("No task found with ID:", taskId);
      return res.status(404).json({ message: 'Task not found' });
    }

    const { teamId, moduleId } = task;

    if (!teamId || !moduleId) {
      console.warn(`❗ Missing teamId or moduleId in task: ${taskId}`);
    }

    // Step 2: Delete the task
    const deletedTask = await Task.findByIdAndDelete(taskId);
    console.log('✅ Deleted Task:', deletedTask);

    // Step 3: Delete related Data if teamId and moduleId are available
    if (teamId && moduleId) {
      const dataDeleteResult = await Data.deleteMany({ teamId, moduleId });
      console.log(`🗑️ Deleted ${dataDeleteResult.deletedCount} Data entries`);

      // Remove submissions from other tasks
      const submissionUpdateResult = await Task.updateMany(
        {},
        { $pull: { submissions: { teamId, moduleId } } }
      );
      console.log(`🔄 Updated ${submissionUpdateResult.modifiedCount} tasks to remove submissions`);

      // Step 4: Delete related files from /uploads
      const uploadDir = path.join(__dirname, '..', 'uploads');
      const matchString = `${teamId}_${moduleId}`.replace(/[@.]/g, '_');

      fs.readdir(uploadDir, (err, files) => {
        if (err) {
          console.error('⚠️ Error reading uploads directory:', err);
        } else {
          files.forEach(file => {
            if (file.includes(matchString)) {
              const filePath = path.join(uploadDir, file);
              fs.unlink(filePath, err => {
                if (err) {
                  console.error(`❌ Error deleting file ${file}:`, err);
                } else {
                  console.log(`✅ Deleted file: ${file}`);
                }
              });
            }
          });
        }
      });
    }

    // Final Response
    return res.status(200).json({
      message: 'Task and related data deleted successfully',
      deletedTask
    });

  } catch (error) {
    console.error('🔥 Error deleting task and related data:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});










//file end points---------------------------------------------------------------------------------------


// ✅ Route to get team members by team ID (excluding current user)
router.get('/team-members/:teamId', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;

    const teamMembers = await User.find({
      team_id: teamId,
      _id: { $ne: req.user.id }
    });

    res.status(200).json(teamMembers);
  } catch (err) {
    console.error('Error fetching team members:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Route to fetch data based on user role
router.get('/datafetch/:email', authMiddleware, async (req, res) => {
  const loggedInUser = req.user;
  const { role, email: userEmail } = loggedInUser;
  const { email } = req.params;

  try {
    let files = [];
    let newname = null;

    if (role === 'team-lead') {
      const teamLead = await User.findOne({ email });
      if (!teamLead) {
        return res.status(404).json({ message: 'Team not found for this team lead' });
      }

      const users = await User.findOne({ team_id: teamLead.team_id, email });
      if (users) {
        newname = users.name;
      }

      const teammates = await User.find({
        team_id: teamLead.team_id,
        _id: { $ne: loggedInUser.id }
      });

      const teammateEmails = teammates.map(member => member.email);
      files = await Data.find({ assignEmail: { $in: teammateEmails } });

    } else if (role === 'employee') {
      files = await Data.find({ assignEmail: userEmail });
    } else {
      return res.status(403).json({ message: 'Invalid role or not authorized' });
    }

    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'No data found here' });
    }

    res.status(200).json({ success: true, files, newname });

  } catch (error) {
    console.error('Error fetching data by role:', error);
    res.status(500).json({ message: 'Server error' });
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


router.post('/data/:moduleId/:dayIndex/:email/action', async (req, res) => {
  const { moduleId, dayIndex } = req.params;
  const { action } = req.body;

  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }

  try {
    const data = await Data.findOneAndUpdate(
      { moduleId, dayIndex },
      { Actions: action },
      { new: true }
    );

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    // Update the corresponding submission's action in Task
    const task = await Task.findOne({ moduleId });

    if (task) {
      const submission = task.submissions.find(
        s => s.day === dayIndex.toString()
      );

      if (submission) {
        submission.action = action;
        await task.save();
      }
    }

    // ✅ Send response only once
    res.status(200).json({ message: `Successfully ${action} today task !`, data });

  } catch (error) {
    console.error('Action update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});




module.exports = router;
