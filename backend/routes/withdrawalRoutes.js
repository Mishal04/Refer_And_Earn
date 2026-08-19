const express = require('express');
const router = express.Router();
const {
  requestWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  updateWithdrawalStatus,
} = require('../controllers/withdrawalController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, requestWithdrawal);
router.get('/mine', protect, getMyWithdrawals);
router.get('/', protect, isAdmin, getAllWithdrawals);
router.put('/:id', protect, isAdmin, updateWithdrawalStatus);

module.exports = router;
