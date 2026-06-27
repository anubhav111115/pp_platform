const express = require('express');
const Note = require('../models/Note');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ pinned: -1, updatedAt: -1 });
    res.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const note = await Note.create({
      userId: req.user._id,
      title: String(req.body.title || 'Untitled Note').trim() || 'Untitled Note',
      content: String(req.body.content || ''),
      tags: Array.isArray(req.body.tags) ? req.body.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
      pinned: Boolean(req.body.pinned)
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Error creating note' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    note.title = req.body.title !== undefined ? String(req.body.title).trim() || 'Untitled Note' : note.title;
    note.content = req.body.content !== undefined ? String(req.body.content) : note.content;
    note.tags = Array.isArray(req.body.tags) ? req.body.tags.map((tag) => String(tag).trim()).filter(Boolean) : note.tags;
    note.pinned = req.body.pinned !== undefined ? Boolean(req.body.pinned) : note.pinned;
    note.updatedAt = new Date();

    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Error updating note' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Error deleting note' });
  }
});

module.exports = router;
