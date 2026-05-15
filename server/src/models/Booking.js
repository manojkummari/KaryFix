const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: true,
    },
    subServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubService',
      required: true,
    },
    // Legacy fields for backward compatibility
    category: {
      type: String,
      required: false,
    },
    subService: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    price: {
      estimated: {
        type: Number,
        default: 0,
      },
      final: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: [
        'payment_pending',
        'pending',
        'requested',
        'assigned',
        'accepted',
        'on-the-way',
        'in-progress',
        'verification_pending',
        'completed',
        'cancelled',
        'rejected',
      ],
      default: 'pending',
    },
    statusTimeline: [
      {
        status: {
          type: String,
        },
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
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      address: {
        type: String,
        required: true,
      },
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    photos: [
      {
        url: String,
        uploadedBy: {
          type: String,
          enum: ['customer', 'technician'],
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    report: {
      type: String,
      default: '',
    },
    invoice: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['wallet', 'cash', 'upi', 'card', 'online'],
      default: 'cash',
    },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
    },
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      review: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add initial status to timeline on creation
bookingSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusTimeline.push({
      status: this.status,
      timestamp: new Date(),
      note: 'Booking created',
    });
  }
  next();
});

// Index for geospatial queries
bookingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);
