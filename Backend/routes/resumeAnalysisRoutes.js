const express = require('express');
const multer = require('multer');
const path = require('path');
const { analyzeResume } = require('../controllers/resumeAnalysisController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/analyze', upload.single('resume'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const result = await analyzeResume(filePath);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
