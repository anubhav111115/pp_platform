const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const VALID_STATUSES = ['applied', 'screening', 'interview', 'offer', 'rejected'];

router.get('/', verifyToken, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const company = String(req.body.company || '').trim();
    const role = String(req.body.role || '').trim();

    if (!company || !role) {
      return res.status(400).json({ message: 'company and role are required' });
    }

    const job = await Job.create({
      userId: req.user._id,
      company,
      role,
      status: VALID_STATUSES.includes(req.body.status) ? req.body.status : 'applied',
      appliedDate: req.body.appliedDate || new Date(),
      jobUrl: String(req.body.jobUrl || '').trim(),
      salary: String(req.body.salary || '').trim(),
      notes: String(req.body.notes || '')
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { jobs_applied: 1 } });

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Error creating job' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = {
      company: req.body.company !== undefined ? String(req.body.company).trim() : job.company,
      role: req.body.role !== undefined ? String(req.body.role).trim() : job.role,
      status: VALID_STATUSES.includes(req.body.status) ? req.body.status : job.status,
      appliedDate: req.body.appliedDate || job.appliedDate,
      jobUrl: req.body.jobUrl !== undefined ? String(req.body.jobUrl).trim() : job.jobUrl,
      salary: req.body.salary !== undefined ? String(req.body.salary).trim() : job.salary,
      notes: req.body.notes !== undefined ? String(req.body.notes) : job.notes,
      updatedAt: new Date()
    };

    Object.assign(job, updates);
    await job.save();

    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Error updating job' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Job.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user._id, { $inc: { jobs_applied: -1 } });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Error deleting job' });
  }
});

module.exports = router;
