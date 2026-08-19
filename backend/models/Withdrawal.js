const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ['easypaisa', 'jazzcash', 'bank'],
      required: true,
    },
    accountInfo: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'paid'],
      default: 'requested',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
