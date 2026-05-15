const mongoose = require('mongoose');

const technicianProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    serviceCategory: {
      type: String,
      enum: [
        'electronics',
        'vehicle',
        'motor-rewinding',
        'tailoring',
        'laundry',
        'interior',
        'waste-collection',
        'student-drop',
      ],
      required: [true, 'Please select a service category'],
    },
    documents: {
      idProof: {
        type: String,
        default: '',
      },
      certification: {
        type: String,
        default: '',
      },
      photo: {
        type: String,
        default: '',
      },
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
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
        default: '',
      },
    },
    availability: {
      type: Boolean,
      default: true,
    },
    earnings: {
      total: {
        type: Number,
        default: 0,
      },
      pending: {
        type: Number,
        default: 0,
      },
      completed: {
        type: Number,
        default: 0,
      },
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    // Real-time location for tracking
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
technicianProfileSchema.index({ location: '2dsphere' });
technicianProfileSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('TechnicianProfile', technicianProfileSchema);
