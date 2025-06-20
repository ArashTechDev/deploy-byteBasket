// backend/src/db/models/foodbanks/FoodBank.js
const mongoose = require('mongoose');

const foodBankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food bank name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    province: {
      type: String,
      required: [true, 'Province is required']
    },
    postal_code: {
      type: String,
      required: [true, 'Postal code is required']
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  capacity: {
    type: Number,
    default: 1000
  },
  current_inventory_count: {
    type: Number,
    default: 0
  },
  operating_hours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for location-based queries
foodBankSchema.index({ 'location.city': 1 });
foodBankSchema.index({ status: 1 });

module.exports = mongoose.model('FoodBank', foodBankSchema);