const router = require('express').Router();
const { ensureAuth } = require('../middleware/authMiddleware');
const LearningStyle = require('../models/learningStyleModel');


// POST: Save assessment results (expects { visual, auditory, kinesthetic, reading })
router.post('/', ensureAuth, async (req, res) => {
  try {
    const id = await LearningStyle.add(req.user.id, req.body);
    res.json({ message: "Learning style assessment saved", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Return latest assessment for user
router.get('/', ensureAuth, async (req, res) => {
  try {
    const result = await LearningStyle.getByUser(req.user.id);
    if (!result) return res.status(404).json({ error: "No assessment found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
