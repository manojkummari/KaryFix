const mongoose = require('mongoose');

const constructionMaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['cement', 'steel', 'sand', 'bricks', 'tiles', 'paint', 'electrical', 'plumbing', 'other'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    unit: {
      type: String,
      enum: ['kg', 'bag', 'piece', 'liter', 'sq.ft', 'meter', 'bundle'],
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      default: 100,
      min: 0,
    },
    brand: {
      type: String,
      default: '',
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    active: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ConstructionMaterial', constructionMaterialSchema);
