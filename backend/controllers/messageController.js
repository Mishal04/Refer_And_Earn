const Message = require('../models/Message');

// @desc   Get chat history between logged-in user and another user
// @route  GET /api/messages/:userId
const getConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin: list all referrers with their latest message (for chat sidebar)
// @route  GET /api/messages/conversations
const getAllConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    const seen = new Set();
    const conversations = [];

    for (const msg of messages) {
      const otherUser =
        msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender;

      if (!seen.has(otherUser._id.toString())) {
        seen.add(otherUser._id.toString());
        conversations.push({
          user: otherUser,
          lastMessage: msg.text,
          lastMessageTime: msg.createdAt,
        });
      }
    }

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getConversation, getAllConversations };
