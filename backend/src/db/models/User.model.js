const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'donor', 'recipient', 'volunteer'],
      default: 'recipient',
    },
    dietary_restrictions: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
    verification_status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    foodbank_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodBank',
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });

// Check if model already exists before creating it
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
