const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const OpenAI = require('openai');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Upload resume
router.post('/upload', verifyToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const resume = new Resume({
      userId: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path
    });

    await resume.save();

    res.json({ 
      resumeId: resume._id,
      filename: resume.originalName
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Error uploading resume' });
  }
});

// Analyze resume
router.post('/analyze/:resumeId', verifyToken, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.resumeId);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to analyze this resume' });
    }

    // Read and parse PDF
    const dataBuffer = fs.readFileSync(resume.filePath);
    const data = await pdfParse(dataBuffer);
    const resumeText = data.text;

    // Send to OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are an expert ATS resume analyzer. Analyze the resume text and return ONLY valid JSON with these exact keys: ats_score (number 0-100), strengths (array of 4 strings), weaknesses (array of 4 strings), missing_keywords (array of 6 strings), suggestions (array of 5 actionable strings), summary (string, 2 sentences), top_skills (array of 6 strings)" 
        },
        { role: "user", content: resumeText }
      ],
      response_format: { type: "json_object" }
    });

    const analysisResult = JSON.parse(completion.choices[0].message.content);

    // Save analysis to DB
    resume.analysisResult = analysisResult;
    resume.atsScore = analysisResult.ats_score;
    await resume.save();

    // Update user's resume score
    await User.findByIdAndUpdate(req.user._id, { resumeScore: analysisResult.ats_score });

    res.json(analysisResult);
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ message: 'Error analyzing resume' });
  }
});

// Get resume history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ uploadedAt: -1 })
      .select('filename originalName uploadedAt atsScore analysisResult');

    res.json(resumes);
  } catch (error) {
    console.error('Resume history error:', error);
    res.status(500).json({ message: 'Error fetching resume history' });
  }
});

module.exports = router;
