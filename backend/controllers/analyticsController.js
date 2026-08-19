const Lead = require('../models/Lead');
const User = require('../models/User');
const Commission = require('../models/Commission');
const Withdrawal = require('../models/Withdrawal');

// @desc   Admin dashboard summary stats
// @route  GET /api/analytics/summary
const getSummary = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments({});
    const completedLeads = await Lead.countDocuments({ status: 'completed' });
    const pendingLeads = await Lead.countDocuments({ status: 'pending' });

    const revenueResult = await Lead.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$projectValue' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const commissionResult = await Commission.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalCommissionsPaid = commissionResult.length > 0 ? commissionResult[0].total : 0;

    const totalReferrers = await User.countDocuments({ role: 'referrer' });

    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'requested' });

    const conversionRate =
      totalLeads > 0 ? ((completedLeads / totalLeads) * 100).toFixed(1) : 0;

    res.json({
      totalLeads,
      completedLeads,
      pendingLeads,
      totalRevenue,
      totalCommissionsPaid,
      totalReferrers,
      pendingWithdrawals,
      conversionRate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Top referrers by total commission earned
// @route  GET /api/analytics/top-referrers
const getTopReferrers = async (req, res) => {
  try {
    const topReferrers = await Commission.aggregate([
      {
        $group: {
          _id: '$user',
          totalEarned: { $sum: '$amount' },
          totalCommissions: { $sum: 1 },
        },
      },
      { $sort: { totalEarned: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$userInfo.name',
          email: '$userInfo.email',
          totalEarned: 1,
          totalCommissions: 1,
        },
      },
    ]);

    res.json(topReferrers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSummary, getTopReferrers };
