// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskName: { type: String, required: true },
  assignEmail: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  taskFile: { type: String, required: true }, // store file path
  accessKey: String,
  moduleId: { type: String, required: true }, // Added moduleId field
  submissions: [{
    filePath: String,
    assignEmail: String,
    day: String,
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
