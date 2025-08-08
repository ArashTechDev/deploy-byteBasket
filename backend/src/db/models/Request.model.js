const mongoose = require('mongoose');

const RequestItemSchema = new mongoose.Schema({
  inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, default: 1, min: 1 }
}, { _id: false });

const RequestSchema = new mongoose.Schema({
  requestId: { type: String, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [RequestItemSchema], default: [] },
  specialInstructions: { type: String, default: '' },
  pickupDateTime: { type: Date, required: true, index: true },
  dietaryRestrictions: [{ type: String }],
  allergies: { type: String, default: '' },
  status: { type: String, enum: ['Pending','Approved','Ready','Fulfilled','Cancelled'], default: 'Pending', index: true },
  confirmationSent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);
