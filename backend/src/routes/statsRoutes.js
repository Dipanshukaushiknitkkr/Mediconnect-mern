const express = require('express');
const router = express.Router();
const { getPublicStats } = require('../controllers/statsController');

// @route   GET /api/v1/stats/public & /api/stats/public
// @desc    Get real public metrics & reviews for landing page
// @access  Public
router.get('/public', getPublicStats);

module.exports = router;
