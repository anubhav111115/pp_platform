const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['applied', 'screening', 'interview', 'offer', 'rejected'],
      default: 'applied'
    },
    appliedDate: { type: Date, default: Date.now },
    jobUrl: { type: String, default: '' },
    salary: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

module.exports = mongoose.model('Job', jobSchema);
