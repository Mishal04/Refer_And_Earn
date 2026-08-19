const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    clientContact: {
      type: String,
      required: true,
    },
    projectDetails: {
      type: String,
      required: true,
    },
    projectValue: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'in_progress', 'completed', 'rejected'],
      default: 'pending',
    },
    source: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
