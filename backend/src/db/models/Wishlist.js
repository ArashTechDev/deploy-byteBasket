// backend/src/db/models/Wishlist.model.js
const mongoose = require('mongoose');
const { cartItemSchema } = require('./Cart.model');

const wishlistSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    items: [cartItemSchema],
    is_default: {
      type: Boolean,
      default: false,
    },
    total_items: {
      type: Number,
      default: 0,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update total_items before saving
wishlistSchema.pre('save', function (next) {
  this.total_items = this.items.reduce((total, item) => total + item.quantity, 0);
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
