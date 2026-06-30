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

const MONGO_URI = process.env.MONGO_URI;
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY;
require('./config/passport');

const app = express();

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', 'https://your-vercel-url.vercel.app'],
  credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(session({ secret: 'prepai_secret_123', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

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

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use((err, req, res, next) => res.status(500).json({ message: 'Something went wrong!' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));