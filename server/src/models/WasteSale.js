const mongoose = require('mongoose');

const wasteSaleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    wasteOfficerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    materialType: {
      type: String,
      enum: [
        'plastic',
        'paper',
        'metal',
        'glass',
        'electronic',
        'organic',
        'mixed',
      ],
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerKg: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['requested', 'collected', 'verified', 'completed', 'cancelled'],
      default: 'requested',
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    collectedDate: {
      type: Date,
      default: null,
    },
    verifiedDate: {
      type: Date,
      default: null,
    },
    creditedToWallet: {
      type: Boolean,
      default: false,
    },
    walletTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WalletTransaction',
      default: null,
    },
    photos: [
      {
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total before saving
wasteSaleSchema.pre('save', function (next) {
  if (this.weight && this.pricePerKg) {
    this.total = this.weight * this.pricePerKg;
  }
  next();
});

module.exports = mongoose.model('WasteSale', wasteSaleSchema);
