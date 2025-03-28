const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware'); 

// ✅ Get chat list (employees for team leaders, vice versa)
router.get('/chat-list',authMiddleware, async (req, res) => {
    const {team_id,email}=req.query;
    try {
        const users = await User.find({ team_id , email: { $ne: email },_id:{$ne:req.user.id}});
        // console.log("id:",team_id)
        // console.log("Chat_Names:",users)

        if (!users.length) {
            return res.status(403).json({ error: 'No users found or unauthorized access.' });
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
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: userId },
                { sender: userId, receiver: req.user.id }
            ]
        }).sort({ timestamp: 1 }); 
        const user = await User.findById(userId);
        res.json({ messages, user });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✅ Send a message
router.post('/send', authMiddleware, async (req, res) => {
    try {
        const { receiver, message } = req.body;
        const newMessage = new Message({
            sender: req.user.id,
            receiver,
            message
        });

        await newMessage.save();
        res.json({ success: true, message: 'Message sent' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
