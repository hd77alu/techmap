const router = require('express').Router();
const { ensureAuth } = require('../middleware/authMiddleware');
const { getTrends } = require('../controllers/trendsController');

router.get('/', ensureAuth, getTrends);
module.exports = router;