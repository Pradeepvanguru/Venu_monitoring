const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String},
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }, // Tracks if the message is read
    edited: { type: Boolean, default: false }, // Tracks if the message has been edited
    deleted: { type: Boolean, default: false }, // Soft delete instead of actual deletion
    files:{type:String},
    reactions: [{ userId: mongoose.Schema.Types.ObjectId, emoji: String }] // Users can react to messages
});

module.exports = mongoose.model('Message', MessageSchema);
