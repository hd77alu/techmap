const router = require('express').Router();
const { ensureAuth } = require('../middleware/authMiddleware');
const { getTrends } = require('../controllers/trendsController');

router.get('/', ensureAuth, async (req, res) => {
  const data = await Trend.getAll();
  res.json(data);
});