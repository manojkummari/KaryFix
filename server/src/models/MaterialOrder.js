const mongoose = require('mongoose');

const materialOrderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        materialId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ConstructionMaterial',
          required: true,
        },
        name: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        unit: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryAddress: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['wallet', 'cash', 'upi', 'card'],
      default: 'cash',
    },
    deliveryDate: {
      type: Date,
      default: null,
    },
    deliveryNotes: {
      type: String,
      default: '',
    },
    statusTimeline: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: '',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add initial status to timeline on creation
materialOrderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusTimeline.push({
      status: this.status,
      timestamp: new Date(),
      note: 'Order placed',
    });
  }
  next();
});

module.exports = mongoose.model('MaterialOrder', materialOrderSchema);
