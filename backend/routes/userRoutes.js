const express = require('express');
const router = express.Router();
const { getAllUsers, getUserDashboard } = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/', protect, isAdmin, getAllUsers);
router.get('/:id', protect, isAdmin, getUserDashboard);
router.get('/:id/dashboard', protect, isAdmin, getUserDashboard);

module.exports = router;
