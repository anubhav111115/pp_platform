const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatar: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  resumeScore: { type: Number, default: 0 },
  dsa_solved: { type: Number, default: 0 },
  interviews_done: { type: Number, default: 0 },
  jobs_applied: { type: Number, default: 0 },
  targetCompanies: [{ type: String }],
  targetRole: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
