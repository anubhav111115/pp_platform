const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  company: { type: String, required: true },
  role: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  questions: [{
    question: { type: String, required: true },
    type: { type: String, enum: ['behavioral', 'technical', 'hr'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    hint: { type: String }
  }],
  answers: [{
    questionIndex: { type: Number, required: true },
    answer: { type: String, required: true },
    score: { type: Number },
    feedback: { type: String },
    betterAnswerHint: { type: String },
    keywordsUsed: [{ type: String }],
    keywordsMissed: [{ type: String }],
    verdict: { type: String, enum: ['poor', 'average', 'good', 'excellent'] }
  }],
  overallScore: { type: Number, default: 0 },
  completedAt: { type: Date },
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interview', interviewSchema);
