const mongoose = require('mongoose');

const subServiceSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a service name'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    priceRange: {
      min: {
        type: Number,
        required: true,
        min: 0,
      },
      max: {
        type: Number,
        required: true,
        min: 0,
      },
      unit: {
        type: String,
        default: 'INR',
      },
    },
    priceType: {
      type: String,
      enum: ['fixed', 'range', 'per-item', 'per-hour', 'custom'],
      default: 'range',
    },
    estimatedDuration: {
      value: {
        type: Number,
        default: 0,
      },
      unit: {
        type: String,
        enum: ['minutes', 'hours', 'days'],
        default: 'hours',
      },
    },
    features: [
      {
        type: String,
      },
    ],
    requirements: [
      {
        type: String,
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create slug from name before saving
subServiceSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Index for faster queries
subServiceSchema.index({ categoryId: 1, active: 1 });
subServiceSchema.index({ slug: 1 });

module.exports = mongoose.model('SubService', subServiceSchema);
