const router = require('express').Router();
const { ensureAuth } = require('../middleware/authMiddleware');
const Project = require('../models/projectModel');

router.get('/', ensureAuth, async (req, res) => {
  try {
    const data = await Project.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
