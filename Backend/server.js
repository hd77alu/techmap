const express = require('express');
const app = require('./app');
const path = require('path');
const { ensureAuth } = require('./middleware/authMiddleware');

// Serve welcome page as default for unauthenticated users
app.get('/', (req, res) => {
    if (req.user) {
        // If user is already authenticated, redirect to dashboard
        res.redirect('/dashboard');
    } else {
        // Serve welcome page for unauthenticated users
        res.sendFile(path.join(__dirname, '../frontend/welcome.html'));
    }
});

// Serve dashboard for authenticated users
app.get('/dashboard', ensureAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Serve other static files (but not as default)
app.use(express.static(path.join(__dirname, '..', 'frontend'), {
    index: false // Don't serve index.html as default
}));

// Handle other routes - redirect to appropriate page based on auth status
app.get('*', (req, res) => {
    if (req.user) {
        res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
    } else {
        res.redirect('/');
    }
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
    console.log('Use CTRL + C to exit');
});