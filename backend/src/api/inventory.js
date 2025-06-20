// backend/src/api/routes/inventory.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Inventory = require('../db/models/inventory/Inventory');
const Foodbank = require('../db/models/foodbanks/Foodbank');

// Helper function for pagination
const getPaginationData = (page, limit, total) => ({
  currentPage: parseInt(page),
  totalPages: Math.ceil(total / limit),
  totalItems: total,
  limit: parseInt(limit),
  hasNext: page < Math.ceil(total / limit),
  hasPrev: page > 1
});

// Helper function to build MongoDB query from filters
const buildInventoryQuery = (filters) => {
  const query = {};
  
  // Text search
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  // Category filter
  if (filters.category) {
    query.category = new RegExp(filters.category, 'i');
  }
  
  // Dietary category filter
  if (filters.dietary_category) {
    query.dietary_category = filters.dietary_category;
  }
  
  // Foodbank filter
  if (filters.foodbank_id && mongoose.Types.ObjectId.isValid(filters.foodbank_id)) {
    query.foodbank_id = filters.foodbank_id;
  }
  
  // Storage location filter
  if (filters.location) {
    query.storage_location = new RegExp(filters.location, 'i');
  }
  
  // Expiring soon filter (next N days)
  if (filters.expiring_soon === 'true') {
    const days = parseInt(filters.expiring_days) || 7;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    query.expiration_date = {
      $gte: new Date(),
      $lte: futureDate
    };
  }
  
  // Low stock filter
  if (filters.low_stock_only === 'true') {
    query.low_stock = true;
  }
  
  // Date range filters
  if (filters.date_from || filters.date_to) {
    query.date_added = {};
    if (filters.date_from) query.date_added.$gte = new Date(filters.date_from);
    if (filters.date_to) query.date_added.$lte = new Date(filters.date_to);
  }
  
  return query;
};

// GET /api/inventory - Get all inventory with advanced filtering and search
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      dietary_category,
      foodbank_id,
      location,
      expiring_soon,
      expiring_days,
      low_stock_only,
      date_from,
      date_to,
      sort_by = 'date_added',
      sort_order = 'desc',
      page = 1,
      limit = 20    } = req.query;

    // Build query
    const query = buildInventoryQuery({
      search, category, dietary_category, foodbank_id, location,
      expiring_soon, expiring_days, low_stock_only, date_from, date_to
    });

    // Build sort object
    const validSortColumns = ['item_name', 'category', 'quantity', 'expiration_date', 'date_added', 'last_updated'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'date_added';
    const sortDirection = sort_order.toLowerCase() === 'asc' ? 1 : -1;
    const sortObj = { [sortColumn]: sortDirection };

    // Add text score sorting if searching
    if (search) {
      sortObj.score = { $meta: 'textScore' };
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Cap at 100 items
    const skip = (pageNum - 1) * limitNum;

    // Execute queries
    const [items, totalCount] = await Promise.all([
      Inventory.find(query)
        .populate('foodbank_id', 'name address city state')
        .populate('created_by', 'username full_name')
        .populate('updated_by', 'username full_name')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(), // Use lean() for better performance
      Inventory.countDocuments(query)
    ]);

    // Add computed fields
    const enrichedItems = items.map(item => ({
      ...item,
      is_expiring_soon: item.expiration_date ? 
        (new Date(item.expiration_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
         new Date(item.expiration_date) >= new Date()) : false,
      days_until_expiration: item.expiration_date ? 
        Math.ceil((new Date(item.expiration_date) - new Date()) / (1000 * 60 * 60 * 24)) : null
    }));

    const pagination = getPaginationData(pageNum, limitNum, totalCount);

    res.json({
      success: true,
      items: enrichedItems,
      pagination,
      filters: { search, category, dietary_category, foodbank_id, location, expiring_soon, low_stock_only }
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/inventory/:id - Get single inventory item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid inventory ID' 
      });
    }
    
    const item = await Inventory.findById(id)
      .populate('foodbank_id', 'name address city state phone email')
      .populate('created_by', 'username full_name')
      .populate('updated_by', 'username full_name');
    
    if (!item) {
      return res.status(404).json({ 
        success: false,
        error: 'Inventory item not found' 
      });
    }
    
    res.json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// POST /api/inventory - Create new inventory item
router.post('/', async (req, res) => {
  try {
    const {
      foodbank_id,
      item_name,
      category,
      quantity,
      expiration_date,
      storage_location,
      dietary_category,
      barcode,
      minimum_stock_level,
      created_by
    } = req.body;

    // Validation
    if (!foodbank_id || !item_name || !category || quantity === undefined) {
      return res.status(400).json({ 
        success: false,
        error: 'Required fields: foodbank_id, item_name, category, quantity' 
      });
    }

    // Validate foodbank exists
    if (!mongoose.Types.ObjectId.isValid(foodbank_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid foodbank ID format'
      });
    }

    const foodbank = await Foodbank.findById(foodbank_id);
    if (!foodbank) {
      return res.status(400).json({
        success: false,
        error: 'Foodbank not found'
      });
    }

    // Check for duplicate barcode if provided
    if (barcode) {
      const existingItem = await Inventory.findOne({ 
        barcode, 
        foodbank_id,
        _id: { $ne: req.params.id } // Exclude current item for updates
      });
      
      if (existingItem) {
        return res.status(400).json({
          success: false,
          error: 'Item with this barcode already exists in this foodbank'
        });
      }
    }

    const inventoryData = {
      foodbank_id,
      item_name: item_name.trim(),
      category: category.trim(),
      quantity: parseInt(quantity),
      minimum_stock_level: minimum_stock_level ? parseInt(minimum_stock_level) : 10
    };

    // Add optional fields
    if (expiration_date) inventoryData.expiration_date = new Date(expiration_date);
    if (storage_location) inventoryData.storage_location = storage_location.trim();
    if (dietary_category) inventoryData.dietary_category = dietary_category;
    if (barcode) inventoryData.barcode = barcode.trim();
    if (created_by && mongoose.Types.ObjectId.isValid(created_by)) {
      inventoryData.created_by = created_by;
    }

    const newItem = new Inventory(inventoryData);
    const savedItem = await newItem.save();
    
    // Populate the response
    await savedItem.populate('foodbank_id', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      item: savedItem
    });

  } catch (error) {
    console.error('Error creating inventory item:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// PUT /api/inventory/:id - Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid inventory ID' 
      });
    }

    const {
      foodbank_id,
      item_name,
      category,
      quantity,
      expiration_date,
      storage_location,
      dietary_category,
      barcode,
      minimum_stock_level,
      updated_by
    } = req.body;

    // Check if item exists
    const existingItem = await Inventory.findById(id);
    if (!existingItem) {
      return res.status(404).json({ 
        success: false,
        error: 'Inventory item not found' 
      });
    }

    // Validate foodbank if provided
    if (foodbank_id && !mongoose.Types.ObjectId.isValid(foodbank_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid foodbank ID format'
      });
    }

    if (foodbank_id) {
      const foodbank = await Foodbank.findById(foodbank_id);
      if (!foodbank) {
        return res.status(400).json({
          success: false,
          error: 'Foodbank not found'
        });
      }
    }

    // Check for duplicate barcode if provided
    if (barcode) {
      const duplicateItem = await Inventory.findOne({ 
        barcode, 
        foodbank_id: foodbank_id || existingItem.foodbank_id,
        _id: { $ne: id }
      });
      
      if (duplicateItem) {
        return res.status(400).json({
          success: false,
          error: 'Item with this barcode already exists in this foodbank'
        });
      }
    }

    // Build update object
    const updateData = {};
    if (foodbank_id) updateData.foodbank_id = foodbank_id;
    if (item_name) updateData.item_name = item_name.trim();
    if (category) updateData.category = category.trim();
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (minimum_stock_level !== undefined) updateData.minimum_stock_level = parseInt(minimum_stock_level);
    if (expiration_date !== undefined) {
      updateData.expiration_date = expiration_date ? new Date(expiration_date) : null;
    }
    if (storage_location !== undefined) updateData.storage_location = storage_location?.trim() || null;
    if (dietary_category !== undefined) updateData.dietary_category = dietary_category || null;
    if (barcode !== undefined) updateData.barcode = barcode?.trim() || null;
    if (updated_by && mongoose.Types.ObjectId.isValid(updated_by)) {
      updateData.updated_by = updated_by;
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('foodbank_id', 'name');

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      item: updatedItem
    });

  } catch (error) {
    console.error('Error updating inventory item:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// DELETE /api/inventory/:id - Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid inventory ID' 
      });
    }
    
    const deletedItem = await Inventory.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return res.status(404).json({ 
        success: false,
        error: 'Inventory item not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Inventory item deleted successfully', 
      item: deletedItem 
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/inventory/alerts/low-stock - Get low stock alerts
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const { foodbank_id } = req.query;
    
    const query = { low_stock: true };
    if (foodbank_id && mongoose.Types.ObjectId.isValid(foodbank_id)) {
      query.foodbank_id = foodbank_id;
    }
    
    const lowStockItems = await Inventory.find(query)
      .populate('foodbank_id', 'name address')
      .sort({ quantity: 1 })
      .lean();
    
    res.json({
      success: true,
      count: lowStockItems.length,
      items: lowStockItems
    });
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/inventory/alerts/expiring - Get expiring items alerts
router.get('/alerts/expiring', async (req, res) => {
  try {
    const { days = 7, foodbank_id } = req.query;
    
    const daysAhead = parseInt(days);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    const query = {
      expiration_date: {
        $gte: new Date(),
        $lte: futureDate
      }
    };
    
    if (foodbank_id && mongoose.Types.ObjectId.isValid(foodbank_id)) {
      query.foodbank_id = foodbank_id;
    }
    
    const expiringItems = await Inventory.find(query)
      .populate('foodbank_id', 'name address')
      .sort({ expiration_date: 1 })
      .lean();
    
    // Add days until expiration
    const itemsWithDays = expiringItems.map(item => ({
      ...item,
      days_until_expiration: Math.ceil((new Date(item.expiration_date) - new Date()) / (1000 * 60 * 60 * 24))
    }));
    
    res.json({
      success: true,
      count: itemsWithDays.length,
      items: itemsWithDays
    });
  } catch (error) {
    console.error('Error fetching expiring items alerts:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/inventory/meta/categories - Get available categories
router.get('/meta/categories', async (req, res) => {
  try {
    const { foodbank_id } = req.query;
    
    const matchStage = foodbank_id && mongoose.Types.ObjectId.isValid(foodbank_id) 
      ? { $match: { foodbank_id: new mongoose.Types.ObjectId(foodbank_id) } }
      : { $match: {} };
    
    const categories = await Inventory.aggregate([
      matchStage,
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]);
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/inventory/meta/dietary-categories - Get dietary categories
router.get('/meta/dietary-categories', async (req, res) => {
  try {
    // Get from schema enum
    const dietaryCategories = Inventory.schema.path('dietary_category').enumValues;
    
    res.json({
      success: true,
      dietary_categories: dietaryCategories.map(cat => ({
        value: cat,
        label: cat.replace(/_/g, ' ')
      }))
    });
  } catch (error) {
    console.error('Error fetching dietary categories:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// PATCH /api/inventory/:id/quantity - Quick quantity update
router.patch('/:id/quantity', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, adjustment, updated_by } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid inventory ID' 
      });
    }
    
    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ 
        success: false,
        error: 'Inventory item not found' 
      });
    }
    
    let updatedItem;
    if (quantity !== undefined) {
      updatedItem = await item.updateQuantity(parseInt(quantity), updated_by);
    } else if (adjustment !== undefined) {
      updatedItem = await item.adjustQuantity(parseInt(adjustment), updated_by);
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
      item: updatedItem
    });
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/inventory/stats - Get inventory statistics
router.get('/stats', async (req, res) => {
  try {
    const { foodbank_id } = req.query;
    
    const matchStage = foodbank_id && mongoose.Types.ObjectId.isValid(foodbank_id) 
      ? { $match: { foodbank_id: new mongoose.Types.ObjectId(foodbank_id) } }
      : { $match: {} };
    
    const stats = await Inventory.aggregate([
      matchStage,
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          lowStockItems: { 
            $sum: { $cond: [{ $eq: ['$low_stock', true] }, 1, 0] } 
          },
          expiringItems: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$expiration_date', null] },
                    { $lte: ['$expiration_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] },
                    { $gte: ['$expiration_date', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          categories: { $addToSet: '$category' },
          avgQuantity: { $avg: '$quantity' }
        }
      },
      {
        $project: {
          _id: 0,
          totalItems: 1,
          totalQuantity: 1,
          lowStockItems: 1,
          expiringItems: 1,
          categoriesCount: { $size: '$categories' },
          avgQuantity: { $round: ['$avgQuantity', 2] }
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: stats[0] || {
        totalItems: 0,
        totalQuantity: 0,
        lowStockItems: 0,
        expiringItems: 0,
        categoriesCount: 0,
        avgQuantity: 0
      }
    });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router;