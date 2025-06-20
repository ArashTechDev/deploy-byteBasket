// backend/src/db/models/inventory/Inventory.js (UPDATED TO MATCH YOUR COLLECTION SCHEMA)
const mongoose = require('mongoose');

// Define the dietary category enum - MATCHING your existing collection exactly
const dietaryCategoryEnum = [
  'Vegan',
  'Vegetarian', 
  'Gluten-Free',
  'Kosher',
  'Halal'
  // Note: null is handled automatically by making field optional
];

const inventorySchema = new mongoose.Schema({
  foodbank_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Foodbank',
    required: true,
    index: true
  },
  item_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be an integer'
    }
  },
  expiration_date: {
    type: Date,
    default: null,
    index: true
  },
  storage_location: {
    type: String,
    trim: true,
    maxlength: 100,
    default: null
  },
  dietary_category: {
    type: String,
    enum: dietaryCategoryEnum,
    default: null
  },
  date_added: {
    type: Date,
    default: Date.now,
    index: true
  },
  barcode: {
    type: String,
    trim: true,
    maxlength: 50,
    default: null,
    sparse: true,
    index: true
  },
  minimum_stock_level: {
    type: Number,
    default: 10,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Minimum stock level must be an integer'
    }
  },
  low_stock: {
    type: Boolean,
    default: false,
    index: true
  },
  // Additional fields for better tracking
  last_updated: {
    type: Date,
    default: Date.now
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    default: null
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  collection: 'inventory'
});

// Indexes for performance - matching your collection setup
inventorySchema.index({ foodbank_id: 1, category: 1 });
inventorySchema.index({ foodbank_id: 1, low_stock: 1 });
inventorySchema.index({ expiration_date: 1, quantity: 1 });
inventorySchema.index({ item_name: 'text', category: 'text' });

// Unique barcode per foodbank (sparse allows nulls)
inventorySchema.index(
  { barcode: 1, foodbank_id: 1 }, 
  { unique: true, sparse: true }
);

// Virtual for checking if item is expiring soon
inventorySchema.virtual('is_expiring_soon').get(function() {
  if (!this.expiration_date) return false;
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  return this.expiration_date <= sevenDaysFromNow && this.expiration_date >= new Date();
});

// Virtual for days until expiration
inventorySchema.virtual('days_until_expiration').get(function() {
  if (!this.expiration_date) return null;
  const today = new Date();
  const expirationDate = new Date(this.expiration_date);
  const timeDiff = expirationDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Pre-save middleware to update low_stock status and last_updated
inventorySchema.pre('save', function(next) {
  this.low_stock = this.quantity <= this.minimum_stock_level;
  this.last_updated = new Date();
  next();
});

// Pre-update middleware
inventorySchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  const update = this.getUpdate();
  if (update.quantity !== undefined || update.minimum_stock_level !== undefined) {
    const quantity = update.quantity || this.quantity;
    const minLevel = update.minimum_stock_level || this.minimum_stock_level || 10;
    update.low_stock = quantity <= minLevel;
  }
  update.last_updated = new Date();
  next();
});

// Static methods for common queries
inventorySchema.statics.findLowStock = function(foodbankId = null) {
  const query = { low_stock: true };
  if (foodbankId) query.foodbank_id = foodbankId;
  return this.find(query).populate('foodbank_id', 'name').sort({ quantity: 1 });
};

inventorySchema.statics.findExpiringSoon = function(days = 7, foodbankId = null) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  const query = {
    expiration_date: {
      $gte: new Date(),
      $lte: futureDate
    }
  };
  
  if (foodbankId) query.foodbank_id = foodbankId;
  
  return this.find(query)
    .populate('foodbank_id', 'name')
    .sort({ expiration_date: 1 });
};

inventorySchema.statics.searchItems = function(searchTerm, filters = {}) {
  const query = {
    $text: { $search: searchTerm }
  };
  
  // Apply additional filters
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      query[key] = filters[key];
    }
  });
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .populate('foodbank_id', 'name');
};

// Instance methods
inventorySchema.methods.updateQuantity = function(newQuantity, userId = null) {
  this.quantity = newQuantity;
  this.low_stock = newQuantity <= this.minimum_stock_level;
  if (userId) this.updated_by = userId;
  return this.save();
};

inventorySchema.methods.adjustQuantity = function(adjustment, userId = null) {
  const newQuantity = Math.max(0, this.quantity + adjustment);
  return this.updateQuantity(newQuantity, userId);
};

// Ensure virtuals are included in JSON output
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);