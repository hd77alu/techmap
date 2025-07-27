const express = require('express');
const { getResources, getResourceFilters } = require('../controllers/resourceController');
const router = express.Router();

router.get('/', getResources);
router.get('/filters', getResourceFilters);

module.exports = router;