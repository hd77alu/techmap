const express = require('express');
const session = require('express-session');
const passport = require('./config/passportSetup');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', require('./routes/authRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/trends', require('./routes/trendsRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/learning-style', require('./routes/learningRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

module.exports = app;