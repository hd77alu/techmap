const router = require('express').Router();
const { ensureAuth } = require('../middleware/authMiddleware');

// Returns the currently logged-in user's profile
router.get('/', ensureAuth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
