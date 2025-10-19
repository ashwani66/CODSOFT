const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String }, // optional detailed description
  assigneeName: { type: String },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deadline: { type: Date },
  status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
