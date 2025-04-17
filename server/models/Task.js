// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  team_id: { type: String, required: true }, 
  taskName: { type: String, required: true },
  moduleSummury:{type:String, require:true},
  assignEmail: { type: [String], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  taskFile: { type: String, required: true }, // store file path
  moduleId: { type: String, required: true }, // Added moduleId field
  submissions: [{
    filePath: String,
    assignEmail: String,
    day: String,
    action:String,
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
