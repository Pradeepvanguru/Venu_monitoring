const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware'); 
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');



// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/files/:filename', (req, res) => {
    const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.sendFile(filePath);
    });
});

// ✅ Get chat list (employees for team leaders, vice versa)
router.get('/chat-list',authMiddleware, async (req, res) => {
    const {team_id,email}=req.query;
    try {
        const users = await User.find({ team_id , email: { $ne: email },_id:{$ne:req.user.id}});
        // console.log("id:",team_id,req.user.id)
        // console.log("Chat_Names:",email)

        if (!users.length) {
            return res.status(403).json({ error: 'No users found' });
        }
        
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✅ Get chat messages between two users
router.get('/messages/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const newMessage = await Message.find({
            $or: [
                { sender: req.user.id, receiver: userId },
                { sender: userId, receiver: req.user.id }
            ]
        }).sort({ timestamp: 1 }); 

        const messagesWithFileURLs = newMessage.map(msg => ({
            ...msg._doc,
            fileUrl: msg.files ? `${req.protocol}://${req.get('host')}/api/messages/files/${msg.files}` : null
        }));

        // console.log("userId:",req.user.id)
        const user = await User.findById(userId);
        const client=req.user.id
        res.json({ messages:messagesWithFileURLs, user,client,msgid:newMessage._id  });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✅ Send a message
router.post('/send', upload.single('files'), authMiddleware, async (req, res) => {
    
    try {
        const { receiver, message } = req.body;
        const fileUrl = req.file ? req.file.filename : null;

        const newMessage = new Message({
            sender: req.user.id,
            receiver,
            message,
            timestamp: new Date(),
            files: fileUrl,
        });

        await newMessage.save();

        res.json({ success: true, message: newMessage, msgid: newMessage._id });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//Edit message code
router.put('/messages/:messageId', authMiddleware, async (req, res) => {
    try {
        const { messageId } = req.params;
        const { newMessage } = req.body;
        // console.log("id:",messageId)

        const updatedMessage = await Message.findByIdAndUpdate(messageId,{ message: newMessage, edited:true },{ new: true });
        if (!updatedMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json(updatedMessage);
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:messageId', authMiddleware, async (req, res) => {
    try {
        const { messageId } = req.params;
        // console.log("id",messageId)
        // Validate messageId format
        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ error: 'Invalid message ID format' });
        }

        // Find and delete message
        const deletedMessage = await Message.findByIdAndDelete(messageId);

        if (!deletedMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json({ message: 'Message deleted successfully' });

    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
