const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
dotenv.config();

const app = express();
app.use(passport.initialize());
app.use(helmet());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true
}));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(session({
  secret: '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',
  resave: false,
  saveUninitialized: false
}));


const MONGO_URI = 'mongodb+srv://anubhavsingh11112005_db_user:1abVvXWbWtRmBHIL@cluster0.ua6ntag.mongodb.net/prepai?appName=Cluster0';
process.env.GOOGLE_CLIENT_ID = '651437878022-f9brrlpgs07pd83uo69bkh1a5m5oq1lp.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_SECRET = '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';
process.env.GEMINI_API_KEY = 'AQ.Ab8RN6JDp2G8PFWNdRVTRnMfZB4kyUQ1YTu-9sJ-Lcf7fhgjIQ';
require('./config/passport');
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/interviews', require('./routes/interview'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/prep', require('./routes/prep'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/ai', require('./routes/ai'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'PrepAI server is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});