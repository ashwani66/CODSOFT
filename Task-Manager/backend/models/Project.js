const mongoose = require('mongoose');
const crypto = require('crypto');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  teamCode: {
    type: String,
    unique: true,
    required: true,
    default: () => crypto.randomBytes(3).toString('hex') // e.g., 'a1b2c3'
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
