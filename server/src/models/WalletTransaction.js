const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    source: {
      type: String,
      enum: [
        'waste-sale',
        'booking-payment',
        'refund',
        'admin-credit',
        'withdrawal',
        'recharge',
      ],
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'reversed'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
walletTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
