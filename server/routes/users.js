const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const User = require('../models/User');
const Note = require('../models/Note');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const Interview = require('../models/Interview');
const Chat = require('../models/Chat');
const { verifyToken } = require('../middleware/auth');

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile (name, avatar color, targetCompanies, targetRole)
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, avatar, targetCompanies, targetRole } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (targetCompanies !== undefined) updateData.targetCompanies = targetCompanies;
    if (targetRole !== undefined) updateData.targetRole = targetRole;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user password
router.put('/password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If the user registered via password, verify current password
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account and all associated data
router.delete('/account', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete uploaded resume files from disk first
    const resumes = await Resume.find({ userId });
    for (const resume of resumes) {
      if (resume.filePath) {
        fs.unlink(resume.filePath, (err) => {
          if (err) {
            console.error('Error deleting file:', resume.filePath, err.message);
          }
        });
      }
    }

    // Delete database records
    await Resume.deleteMany({ userId });
    await Note.deleteMany({ userId });
    await Job.deleteMany({ userId });
    await Interview.deleteMany({ userId });
    await Chat.deleteMany({ userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
