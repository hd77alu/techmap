const router = require('express').Router();
const { ensureAuth } = require('../middleware/authMiddleware');
const LearningStyle = require('../models/learningStyleModel');

router.post('/', ensureAuth, async (req, res) => {
  try {
    const id = await LearningStyle.add(req.user.id, req.body.style);
    res.json({ message: "Learning style saved", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
