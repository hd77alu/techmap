const router = require('express').Router();
const { ensureAuth } = require('../middleware/authMiddleware');
const { analyze } = require('../controllers/resumeController');

router.post('/', ensureAuth, analyze);
module.exports = router;