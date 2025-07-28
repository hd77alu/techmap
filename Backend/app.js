const express = require('express');
const session = require('express-session');
const passport = require('./config/passportSetup');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || true 
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session configuration for production
app.use(session({ 
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false, 
  saveUninitialized: false,
  cookie: {
    secure: false, // Allow cookies over HTTP for now - Render handles HTTPS termination
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // Add this for better compatibility
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', require('./routes/authRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/trends', require('./routes/trendsRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/styles', require('./routes/learningRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

module.exports = app;