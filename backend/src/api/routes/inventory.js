// backend/src/api/routes/inventory.js  
const express = require('express');
const router = express.Router();
const Inventory = require('../../db/models/inventory/Inventory');
const { authenticate, authorize } = require('../../middleware/auth');
const { authMiddleware, requireRole } = require('../../middleware/authMiddleware'); // Use existing middleware
const { catchAsync } = require('../../utils/errors');

// Apply authentication to all inventory routes
router.use(authMiddleware);

// GET /api/inventory - Get all inventory items with filtering and pagination
router.get('/', catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    foodbank_id,
    low_stock,
    dietary_category,
    sort = '-date_added'
  } = req.query;

  // Build query
  let query = {};
  
  // Filter by foodbank for non-admin users
  if (req.user.role !== 'admin' && req.user.foodbank_id) {
    query.foodbank_id = req.user.foodbank_id;
  } else if (foodbank_id) {
    query.foodbank_id = foodbank_id;
  }

  if (search) {
    query.$or = [
      { item_name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) query.category = category;
  if (low_stock === 'true') query.low_stock = true;
  if (dietary_category) query.dietary_category = dietary_category;

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const total = await Inventory.countDocuments(query);
  
  const items = await Inventory.find(query)
    .populate('foodbank_id', 'name location')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: items,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
}));

// POST /api/inventory - Create new inventory item
router.post('/', requireRole('admin', 'staff'), catchAsync(async (req, res) => {
  const itemData = {
    ...req.body,
    foodbank_id: req.user.foodbank_id || req.body.foodbank_id,
    created_by: req.user.id
  };

  const item = await Inventory.create(itemData);
  await item.populate('foodbank_id', 'name location');

  res.status(201).json({
    success: true,
    message: 'Inventory item created successfully',
    data: item
  });
}));

// GET /api/inventory/:id - Get single inventory item
router.get('/:id', catchAsync(async (req, res) => {
  const item = await Inventory.findById(req.params.id)
    .populate('foodbank_id', 'name location');

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }

  res.json({
    success: true,
    data: item
  });
}));

// PUT /api/inventory/:id - Update inventory item
router.put('/:id', requireRole('admin', 'staff'), catchAsync(async (req, res) => {
  const item = await Inventory.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updated_by: req.user.id },
    { new: true, runValidators: true }
  ).populate('foodbank_id', 'name location');

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }

  res.json({
    success: true,
    message: 'Inventory item updated successfully',
    data: item
  });
}));

// DELETE /api/inventory/:id - Delete inventory item
router.delete('/:id', requireRole('admin', 'staff'), catchAsync(async (req, res) => {
  const item = await Inventory.findByIdAndDelete(req.params.id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }

  res.json({
    success: true,
    message: 'Inventory item deleted successfully'
  });
}));

// PATCH /api/inventory/:id/quantity - Quick quantity update
router.patch('/:id/quantity', requireRole('admin', 'staff'), catchAsync(async (req, res) => {
  const { id } = req.params;
  const { quantity, adjustment, updated_by } = req.body;
  
  const item = await Inventory.findById(id);
  if (!item) {
    return res.status(404).json({ 
      success: false,
      error: 'Inventory item not found' 
    });
  }
  
  let updatedItem;
  if (quantity !== undefined) {
    updatedItem = await item.updateQuantity(parseInt(quantity), req.user.id);
  } else if (adjustment !== undefined) {
    updatedItem = await item.adjustQuantity(parseInt(adjustment), req.user.id);
  } else {
    return res.status(400).json({
      success: false,
      error: 'Either quantity or adjustment must be provided'
    });
  }
  
  await updatedItem.populate('foodbank_id', 'name');
  
  res.json({
    success: true,
    message: 'Quantity updated successfully',
    data: updatedItem
  });
}));

module.exports = router;