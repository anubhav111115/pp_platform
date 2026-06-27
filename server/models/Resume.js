const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  analysisResult: { 
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  uploadedAt: { type: Date, default: Date.now },
  atsScore: { type: Number, default: 0 }
});

module.exports = mongoose.model('Resume', resumeSchema);
