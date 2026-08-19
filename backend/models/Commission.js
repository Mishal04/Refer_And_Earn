const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    level: {
      type: Number,
      enum: [1, 2],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'credited', 'paid'],
      default: 'credited',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Commission', commissionSchema);
