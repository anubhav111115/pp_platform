const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

function parseJsonContent(content) {
  try {
    return JSON.parse(content);
  } catch (error) {
    const match = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) {
      throw error;
    }

    return JSON.parse(match[0]);
  }
}

router.post('/company', verifyToken, async (req, res) => {
  const genAI = new GoogleGenerativeAI('process.env.GEMINI_API_KEY');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
  try {
    const company = String(req.body.company || '').trim();
    const role = String(req.body.role || '').trim();

    if (!company || !role) {
      return res.status(400).json({ message: 'company and role are required' });
    }

    const prompt = `You are a placement expert. Return ONLY JSON: { overview: string, interview_rounds: [ { round: string, description: string, tips: string[] } ], commonly_asked_topics: string[], recommended_resources: [ { title: string, url: string, type: 'video'|'article'|'practice' } ], difficulty: 'easy'|'medium'|'hard', avg_ctc: string, preparation_time: string, insider_tips: string[] }
    
Give complete interview preparation guide for ${role} at ${company}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJsonContent(text.replace(/```json|```/g, '').trim() || '{}');

    res.json({
      overview: String(parsed.overview || ''),
      interview_rounds: Array.isArray(parsed.interview_rounds) ? parsed.interview_rounds : [],
      commonly_asked_topics: Array.isArray(parsed.commonly_asked_topics) ? parsed.commonly_asked_topics : [],
      recommended_resources: Array.isArray(parsed.recommended_resources) ? parsed.recommended_resources : [],
      difficulty: ['easy', 'medium', 'hard'].includes(parsed.difficulty) ? parsed.difficulty : 'medium',
      avg_ctc: String(parsed.avg_ctc || 'Not specified'),
      preparation_time: String(parsed.preparation_time || '2-4 weeks'),
      insider_tips: Array.isArray(parsed.insider_tips) ? parsed.insider_tips : []
    });
  } catch (error) {
    console.error('Company prep error:', error);
    res.status(500).json({ message: 'Error generating company prep guide' });
  }
});

router.post('/dsa-recommendations', verifyToken, async (req, res) => {
  const genAI = new GoogleGenerativeAI('process.env.GEMINI_API_KEY');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
  try {
    const weakTopics = Array.isArray(req.body.weakTopics) ? req.body.weakTopics.filter(Boolean) : [];
    const targetCompany = String(req.body.targetCompany || '').trim();
    const daysAvailable = Number(req.body.daysAvailable);

    if (!targetCompany || !daysAvailable) {
      return res.status(400).json({ message: 'targetCompany and daysAvailable are required' });
    }

    const prompt = `You are a DSA expert. Return ONLY JSON: { study_plan: [ { day: number, topic: string, problems: [ { name: string, difficulty: string, leetcode_number: number, why_important: string } ] } ], priority_topics: string[], daily_target: number }
    
Create ${daysAvailable}-day DSA study plan for ${targetCompany}. Weak areas: ${weakTopics.join(', ')}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJsonContent(text.replace(/```json|```/g, '').trim() || '{}');

    res.json({
      study_plan: Array.isArray(parsed.study_plan) ? parsed.study_plan : [],
      priority_topics: Array.isArray(parsed.priority_topics) ? parsed.priority_topics : weakTopics,
      daily_target: Number(parsed.daily_target) || 3
    });
  } catch (error) {
    console.error('DSA recommendations error:', error);
    res.status(500).json({ message: 'Error generating DSA recommendations' });
  }
});

module.exports = router;
