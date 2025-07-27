const express = require('express');
const { getProjects, getProjectFilters } = require('../controllers/projectController');
const router = express.Router();

router.get('/', getProjects);
router.get('/filters', getProjectFilters);

module.exports = router;
