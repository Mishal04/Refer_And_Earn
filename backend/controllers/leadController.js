const Lead = require('../models/Lead');
const User = require('../models/User');
const Commission = require('../models/Commission');

const LEVEL_1_PERCENT = 15;
const LEVEL_2_PERCENT = 5;

// @desc   Referrer submits a new client lead
// @route  POST /api/leads
const createLead = async (req, res) => {
  try {
    const { clientName, clientContact, projectDetails, source } = req.body;

    const lead = await Lead.create({
      referredBy: req.user._id,
      clientName,
      clientContact,
      projectDetails,
      source,
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Logged-in referrer views only their own leads
// @route  GET /api/leads/mine
const getMyLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ referredBy: req.user._id }).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin views all leads
// @route  GET /api/leads
const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find({})
      .populate('referredBy', 'name email referralCode')
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Admin updates a lead's status (and project value). Triggers commission on completion.
// @route  PUT /api/leads/:id
const updateLeadStatus = async (req, res) => {
  try {
    const { status, projectValue } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const wasAlreadyCompleted = lead.status === 'completed';

    if (status) lead.status = status;
    if (projectValue !== undefined) lead.projectValue = projectValue;

    const updatedLead = await lead.save();

    // Only calculate commission once, the first time a lead becomes "completed"
    if (status === 'completed' && !wasAlreadyCompleted && updatedLead.projectValue > 0) {
      const level1User = await User.findById(updatedLead.referredBy);

      if (level1User) {
        const level1Amount = (updatedLead.projectValue * LEVEL_1_PERCENT) / 100;

        await Commission.create({
          user: level1User._id,
          lead: updatedLead._id,
          level: 1,
          amount: level1Amount,
        });

        level1User.walletBalance += level1Amount;
        await level1User.save();

        // Level 2: the person who invited Level 1 user
        if (level1User.referredBy) {
          const level2User = await User.findById(level1User.referredBy);

          if (level2User) {
            const level2Amount = (updatedLead.projectValue * LEVEL_2_PERCENT) / 100;

            await Commission.create({
              user: level2User._id,
              lead: updatedLead._id,
              level: 2,
              amount: level2Amount,
            });

            level2User.walletBalance += level2Amount;
            await level2User.save();
          }
        }
      }
    }

    res.json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createLead, getMyLeads, getAllLeads, updateLeadStatus };
