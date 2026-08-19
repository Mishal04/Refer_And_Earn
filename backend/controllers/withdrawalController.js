const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');

// @desc   Referrer requests a withdrawal
// @route  POST /api/withdrawals
const requestWithdrawal = async (req, res) => {
  try {
    const { amount, method, accountInfo } = req.body;

    const user = await User.findById(req.user._id);

    if (amount > user.walletBalance) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    const withdrawal = await Withdrawal.create({
      user: req.user._id,
      amount,
      method,
      accountInfo,
    });

    // Deduct immediately so the user can't request the same balance twice
    user.walletBalance -= amount;
    await user.save();

    res.status(201).json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Referrer views their own withdrawal history
// @route  GET /api/withdrawals/mine
const getMyWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin views all withdrawal requests
// @route  GET /api/withdrawals
const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin updates withdrawal status (approve/reject/paid)
// @route  PUT /api/withdrawals/:id
const updateWithdrawalStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    // If rejected, refund the amount back to the user's wallet
    if (status === 'rejected' && withdrawal.status !== 'rejected') {
      const user = await User.findById(withdrawal.user);
      if (user) {
        user.walletBalance += withdrawal.amount;
        await user.save();
      }
    }

    withdrawal.status = status;
    const updatedWithdrawal = await withdrawal.save();

    res.json(updatedWithdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  requestWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  updateWithdrawalStatus,
};
