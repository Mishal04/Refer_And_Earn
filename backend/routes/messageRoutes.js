const express = require('express');
const router = express.Router();
const { getConversation, getAllConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getAllConversations);
router.get('/:userId', protect, getConversation);

module.exports = router;
