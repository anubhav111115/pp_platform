const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { body, validationResult } = require('express-validator');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Interview feedback endpoint
router.post('/interview/feedback', [
  body('questions').isArray(),
  body('answers').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { questions, answers } = req.body;

    const prompt = `You are an expert interviewer. Review the following interview answers and provide feedback.

Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Answers:
${answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Please provide:
1. Overall feedback on the answers
2. A score out of 100
3. Specific suggestions for improvement`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert interviewer providing constructive feedback.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000
    });

    const feedbackText = response.choices[0].message.content;

    res.json({
      feedback: feedbackText,
      score: 75 // Default score, could be parsed from response
    });
  } catch (error) {
    console.error('AI feedback error:', error);
    res.status(500).json({ message: 'Error generating AI feedback' });
  }
});

// Resume review endpoint
router.post('/resume/review', [
  body('resume_text').notEmpty(),
  body('job_description').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resume_text, job_description } = req.body;

    const prompt = `You are an expert HR professional. Review the following resume against the job description.

Resume:
${resume_text}

Job Description:
${job_description}

Please provide:
1. Overall assessment
2. Strengths
3. Areas for improvement
4. Specific suggestions`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert HR professional providing resume feedback.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500
    });

    res.json({
      feedback: response.choices[0].message.content
    });
  } catch (error) {
    console.error('Resume review error:', error);
    res.status(500).json({ message: 'Error generating resume review' });
  }
});

// Coding help endpoint
router.post('/coding/help', [
  body('code').notEmpty(),
  body('problem').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, problem } = req.body;

    const prompt = `You are an expert coding interviewer. Help the user with their coding problem.

Problem:
${problem}

User's Code:
${code}

Provide guidance without giving the complete solution. Help them understand the approach.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful coding tutor.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000
    });

    res.json({
      guidance: response.choices[0].message.content
    });
  } catch (error) {
    console.error('Coding help error:', error);
    res.status(500).json({ message: 'Error generating coding help' });
  }
});

module.exports = router;
