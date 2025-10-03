const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Invalid email format']
    },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model('User', userSchema);
