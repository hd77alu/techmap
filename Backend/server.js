const express = require('express');
const app = require('./app');
const path = require('path');

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Always return index.html for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
    console.log('Use CTRL + C to exit');
});