const router = require('express').Router();
const { ensureAuth } = require('../middleware/authMiddleware');
const { getResources } = require('../controllers/resourceController');

router.get('/', ensureAuth, getResources);
module.exports = router;