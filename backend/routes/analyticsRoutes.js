const express = require('express');
const router = express.Router();
const { getSummary, getTopReferrers } = require('../controllers/analyticsController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/summary', protect, isAdmin, getSummary);
router.get('/top-referrers', protect, isAdmin, getTopReferrers);

module.exports = router;
