const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  team_id:{type:String,required:true},
  moduleId: { type: String, required: true },
  assignEmail: { type: String, required: true },
  dayIndex: { type: Number, required: true },
  fileUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  Actions: { type: String, enum: ['pending', 'accept', 'reject'], default: 'pending' }
});

module.exports = mongoose.model('Data', dataSchema);
