const User = require('../models/User');
const Lead = require('../models/Lead');
const Commission = require('../models/Commission');
const Withdrawal = require('../models/Withdrawal');

// @desc   Get all users with aggregated metrics (Admin only)
// @route  GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('referredBy', 'name email referralCode')
      .sort({ createdAt: -1 });

    // Fetch metrics per user
    const userListWithStats = await Promise.all(
      users.map(async (u) => {
        const totalLeads = await Lead.countDocuments({ referredBy: u._id });
        const completedLeads = await Lead.countDocuments({ referredBy: u._id, status: 'completed' });
        
        const commissionAgg = await Commission.aggregate([
          { $match: { user: u._id } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalEarned = commissionAgg.length > 0 ? commissionAgg[0].total : 0;

        const directReferralsCount = await User.countDocuments({ referredBy: u._id });

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          status: u.status || 'active',
          referralCode: u.referralCode,
          referredBy: u.referredBy,
          walletBalance: u.walletBalance || 0,
          paymentDetails: u.paymentDetails,
          createdAt: u.createdAt,
          totalLeads,
          completedLeads,
          totalEarned,
          directReferralsCount,
        };
      })
    );

    res.json(userListWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get detailed dashboard metrics for a specific user (Admin only)
// @route  GET /api/users/:id/dashboard
const getUserDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password').populate('referredBy', 'name email referralCode');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Direct (Level 1) Referrals with lead completion stats
    const level1Referrals = await User.find({ referredBy: id })
      .select('name email phone role status referralCode walletBalance createdAt')
      .sort({ createdAt: -1 });

    const level1WithStats = await Promise.all(
      level1Referrals.map(async (r) => {
        const completedCount = await Lead.countDocuments({ referredBy: r._id, status: 'completed' });
        const totalCount = await Lead.countDocuments({ referredBy: r._id });
        return {
          ...r.toObject(),
          completedLeadsCount: completedCount,
          totalLeadsCount: totalCount,
          eligibilityStatus: completedCount > 0 ? 'Eligible' : 'Pending',
          pendingReason: completedCount > 0 ? 'Client work completed' : 'Referred user has not brought completed client work yet',
        };
      })
    );

    const level1Ids = level1Referrals.map((r) => r._id);

    // 2. Secondary (Level 2) Referrals with stats
    const level2Referrals = await User.find({ referredBy: { $in: level1Ids } })
      .select('name email phone role status referralCode walletBalance referredBy createdAt')
      .populate('referredBy', 'name email')
      .sort({ createdAt: -1 });

    const level2WithStats = await Promise.all(
      level2Referrals.map(async (r) => {
        const completedCount = await Lead.countDocuments({ referredBy: r._id, status: 'completed' });
        const totalCount = await Lead.countDocuments({ referredBy: r._id });
        return {
          ...r.toObject(),
          completedLeadsCount: completedCount,
          totalLeadsCount: totalCount,
          eligibilityStatus: completedCount > 0 ? 'Eligible' : 'Pending',
          pendingReason: completedCount > 0 ? 'Client work completed' : 'Referred user has not brought completed client work yet',
        };
      })
    );

    // 3. Leads submitted by user with payment eligibility status
    const userLeads = await Lead.find({ referredBy: id }).sort({ createdAt: -1 });
    const userLeadsWithEligibility = userLeads.map((l) => {
      const isCompleted = l.status === 'completed';
      return {
        ...l.toObject(),
        paymentEligibility: isCompleted ? 'Eligible' : l.status === 'rejected' ? 'Ineligible' : 'Pending',
        paymentReason: isCompleted
          ? 'Client work successfully completed'
          : l.status === 'rejected'
          ? 'Lead rejected by admin'
          : 'Client work in progress. Payment released after work completion.',
      };
    });

    // 4. Commissions earned by user
    const userCommissions = await Commission.find({ user: id })
      .populate('lead', 'clientName projectValue status')
      .sort({ createdAt: -1 });

    const totalEarned = userCommissions.reduce((sum, c) => sum + c.amount, 0);

    // 5. Withdrawals history for user
    const userWithdrawals = await Withdrawal.find({ user: id }).sort({ createdAt: -1 });

    const totalWithdrawn = userWithdrawals
      .filter((w) => w.status === 'paid' || w.status === 'approved')
      .reduce((sum, w) => sum + w.amount, 0);

    const pendingWithdrawalsAmount = userWithdrawals
      .filter((w) => w.status === 'requested')
      .reduce((sum, w) => sum + w.amount, 0);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status || 'active',
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        walletBalance: user.walletBalance || 0,
        paymentDetails: user.paymentDetails,
        createdAt: user.createdAt,
      },
      financials: {
        walletBalance: user.walletBalance || 0,
        totalEarned,
        totalWithdrawn,
        pendingWithdrawalsAmount,
      },
      network: {
        level1: level1WithStats,
        level2: level2WithStats,
        totalNetworkCount: level1WithStats.length + level2WithStats.length,
      },
      leads: userLeadsWithEligibility,
      commissions: userCommissions,
      withdrawals: userWithdrawals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, getUserDashboard };
