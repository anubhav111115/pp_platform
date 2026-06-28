const fs = require('fs');
const express = require('express');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const VALID_TYPES = ['behavioral', 'technical', 'hr'];

function normaliseDifficulty(value) {
  return VALID_DIFFICULTIES.includes(value) ? value : 'medium';
}

function toVerdict(score) {
  if (score >= 9) return 'excellent';
  if (score >= 7) return 'good';
  if (score >= 4) return 'average';
  return 'poor';
}

function calculateOverallScore(answers) {
  if (!answers.length) {
    return 0;
  }

  const total = answers.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
  return Number((total / answers.length).toFixed(1));
}

function parseJsonContent(content) {
  try {
    return JSON.parse(content);
  } catch (error) {
    const match = content.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (!match) {
      throw error;
    }

    return JSON.parse(match[0]);
  }
}

async function getLatestResumeText(userId) {
  const resume = await Resume.findOne({ userId }).sort({ uploadedAt: -1 });
  if (!resume) {
    return null;
  }

  const fileBuffer = fs.readFileSync(resume.filePath);
  const parsed = await pdfParse(fileBuffer);
  return parsed.text || null;
}

async function generateQuestions({ resumeText, company, role, difficulty }) {
  const genAI = new GoogleGenerativeAI('process.env.GEMINI_API_KEY');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

  const prompt = `Generate 5 realistic interview questions for a ${role} position at ${company}. Base them on this resume. Mix behavioral and technical. Return JSON array of objects with: question, type (behavioral/technical/hr), difficulty (easy/medium/hard).
  
Role: ${role}
Company: ${company}
Difficulty: ${difficulty}
Resume:
${resumeText || 'No resume provided.'}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseJsonContent(text.replace(/```json|```/g, '').trim() || '[]');
  const questions = Array.isArray(parsed) ? parsed : parsed.questions;

  if (!Array.isArray(questions)) {
    throw new Error('Gemini did not return a valid questions array');
  }

  return questions.slice(0, 5).map((item) => ({
    question: String(item.question || '').trim(),
    type: VALID_TYPES.includes(item.type) ? item.type : 'technical',
    difficulty: VALID_DIFFICULTIES.includes(item.difficulty) ? item.difficulty : difficulty
  }));
}

async function evaluateAnswer({ question, answer, role }) {
  const genAI = new GoogleGenerativeAI('process.env.GEMINI_API_KEY');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

  const prompt = `Evaluate the answer for a ${role} role. Return only valid JSON with keys: score, feedback, better_answer_hint, keywords_used, keywords_missed.
  
Question: ${question}
Answer: ${answer}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseJsonContent(text.replace(/```json|```/g, '').trim() || '{}');

  return {
    score: Math.max(1, Math.min(10, Number(parsed.score) || 1)),
    feedback: String(parsed.feedback || 'No feedback returned.'),
    better_answer_hint: String(parsed.better_answer_hint || ''),
    keywords_used: Array.isArray(parsed.keywords_used) ? parsed.keywords_used : [],
    keywords_missed: Array.isArray(parsed.keywords_missed) ? parsed.keywords_missed : []
  };
}

async function createInterviewSession(req, res) {
  try {
    const company = String(req.body.company || '').trim();
    const role = String(req.body.role || '').trim();
    const difficulty = normaliseDifficulty(req.body.difficulty);
    const useResume = Boolean(req.body.useResume);

    if (!company || !role) {
      return res.status(400).json({ message: 'company and role are required' });
    }

    const resumeText = useResume ? await getLatestResumeText(req.user._id) : null;
    const questions = await generateQuestions({
      resumeText,
      company,
      role,
      difficulty
    });

    const interview = await Interview.create({
      userId: req.user._id,
      company,
      role,
      difficulty,
      questions,
      status: 'in-progress'
    });

    res.status(201).json({
      interviewId: interview._id,
      company,
      role,
      difficulty,
      questions: interview.questions,
      resumeUsed: Boolean(resumeText)
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ message: error.message || 'Error starting interview session' });
  }
}

router.post('/start', verifyToken, createInterviewSession);
router.post('/generate-questions', verifyToken, createInterviewSession);

router.post('/submit-answer', verifyToken, async (req, res) => {
  try {
    const interviewId = String(req.body.interviewId || '').trim();
    const answer = String(req.body.answer || '').trim();
    const questionIndex = Number(req.body.questionIndex);

    if (!interviewId || !answer || Number.isNaN(questionIndex)) {
      return res.status(400).json({ message: 'interviewId, questionIndex, and answer are required' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const question = interview.questions[questionIndex];
    if (!question) {
      return res.status(400).json({ message: 'Invalid question index' });
    }

    const feedback = await evaluateAnswer({
      question: question.question,
      answer,
      role: interview.role
    });

    const answerData = {
      questionIndex,
      answer,
      score: feedback.score,
      feedback: feedback.feedback,
      betterAnswerHint: feedback.better_answer_hint,
      keywordsUsed: feedback.keywords_used,
      keywordsMissed: feedback.keywords_missed,
      verdict: toVerdict(feedback.score)
    };

    const existingAnswerIndex = interview.answers.findIndex((item) => item.questionIndex === questionIndex);
    if (existingAnswerIndex >= 0) {
      interview.answers[existingAnswerIndex] = answerData;
    } else {
      interview.answers.push(answerData);
    }

    interview.answers.sort((a, b) => a.questionIndex - b.questionIndex);
    await interview.save();

    res.json({
      ...feedback,
      verdict: answerData.verdict
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: error.message || 'Error evaluating answer' });
  }
});

async function completeInterview(req, res) {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!interview.answers.length) {
      return res.status(400).json({ message: 'Answer at least one question before saving' });
    }

    const alreadyCompleted = interview.status === 'completed';
    interview.overallScore = calculateOverallScore(interview.answers);
    interview.status = 'completed';
    interview.completedAt = interview.completedAt || new Date();
    interview.answers.sort((a, b) => a.questionIndex - b.questionIndex);
    await interview.save();

    if (!alreadyCompleted) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { interviews_done: 1 }
      });
    }

    res.json({
      interviewId: interview._id,
      overallScore: interview.overallScore,
      company: interview.company,
      role: interview.role,
      difficulty: interview.difficulty,
      completedAt: interview.completedAt,
      questions: interview.questions,
      answers: interview.answers
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ message: 'Error completing interview' });
  }
}

router.post('/:id/complete', verifyToken, completeInterview);
router.post('/complete/:id', verifyToken, completeInterview);

router.get('/history', verifyToken, async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.user._id,
      status: 'completed'
    })
      .sort({ completedAt: -1 })
      .select('company role difficulty overallScore completedAt createdAt');

    res.json({ interviews });
  } catch (error) {
    console.error('Interview history error:', error);
    res.status(500).json({ message: 'Error fetching interview history' });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    interview.answers.sort((a, b) => a.questionIndex - b.questionIndex);
    res.json(interview);
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ message: 'Error fetching interview' });
  }
});

module.exports = router;
