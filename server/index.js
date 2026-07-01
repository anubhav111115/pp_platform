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
const https = require('https');

dotenv.config();

require('./config/passport');

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'https://prepai-placement.vercel.app'
  ],
  credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(session({ secret: process.env.SESSION_SECRET || 'prepai_secret_123', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URI)
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

app.get('/health', (req, res) => res.json({ status: 'ok', message: 'PrepAI server is running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  if (process.env.RENDER_URL) {
    setInterval(() => {
      https.get(`${process.env.RENDER_URL}/health`, (res) => {
        console.log('Keep alive ping:', res.statusCode);
      }).on('error', (err) => {
        console.log('Keep alive error:', err.message);
      });
    }, 14 * 60 * 1000);
  }
});