const express = require('express');
const router = express.Router();
const {
  createLead,
  getMyLeads,
  getAllLeads,
  updateLeadStatus,
} = require('../controllers/leadController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.post('/', protect, createLead);
router.get('/mine', protect, getMyLeads);
router.get('/', protect, isAdmin, getAllLeads);
router.put('/:id', protect, isAdmin, updateLeadStatus);

module.exports = router;
