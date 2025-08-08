// backend/src/controllers/foodRequest.controller.js
const FoodRequest = require('../db/models/FoodRequest.model');
const User = require('../db/models/User');
const { validationResult } = require('express-validator');

class FoodRequestController {
  // Create a new food request
  async createRequest(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const {
        items,
        preferredPickupDate,
        preferredPickupTime,
        specialInstructions,
        dietaryRestrictions,
        allergies,
      } = req.body;

      // Get user's foodbank from their profile
      const user = await User.findById(req.user.id);
      if (!user || !user.foodbank_id) {
        return res.status(400).json({
          success: false,
          message: 'User must be associated with a food bank',
        });
      }

      // Create the food request
      const foodRequest = new FoodRequest({
        recipient_id: req.user.id,
        foodbank_id: user.foodbank_id,
        items: items.map(item => ({
          item_name: item.item_name,
          quantity_requested: item.quantity,
          dietary_category: item.dietary_category,
        })),
        pickup_date: preferredPickupDate,
        pickup_time: preferredPickupTime,
        special_instructions: specialInstructions,
        dietary_restrictions: dietaryRestrictions,
        allergies: allergies,
        status: 'Pending',
        request_date: new Date(),
      });

      await foodRequest.save();
      await foodRequest.populate('recipient_id', 'name email phone');
      await foodRequest.populate('foodbank_id', 'name location phone');

      res.status(201).json({
        success: true,
        message: 'Food request submitted successfully',
        data: foodRequest,
      });
    } catch (error) {
      console.error('Error creating food request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create food request',
        error: error.message,
      });
    }
  }

  // Get user's food requests
  async getUserRequests(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;

      const filter = { recipient_id: req.user.id };
      if (status) {
        filter.status = status;
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { request_date: -1 },
      };

      const requests = await FoodRequest.find(filter)
        .populate('recipient_id', 'name email phone')
        .populate('foodbank_id', 'name location phone')
        .sort(options.sort)
        .limit(options.limit * 1)
        .skip((options.page - 1) * options.limit);

      const total = await FoodRequest.countDocuments(filter);

      res.json({
        success: true,
        data: requests,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total,
        },
      });
    } catch (error) {
      console.error('Error fetching user requests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch requests',
        error: error.message,
      });
    }
  }

  // Get all requests (admin/staff only)
  async getAllRequests(req, res) {
    try {
      const { page = 1, limit = 10, status, foodbank_id } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (foodbank_id) filter.foodbank_id = foodbank_id;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { request_date: -1 },
      };

      const requests = await FoodRequest.find(filter)
        .populate('recipient_id', 'name email phone')
        .populate('foodbank_id', 'name location phone')
        .sort(options.sort)
        .limit(options.limit * 1)
        .skip((options.page - 1) * options.limit);

      const total = await FoodRequest.countDocuments(filter);

      res.json({
        success: true,
        data: requests,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total,
        },
      });
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch requests',
        error: error.message,
      });
    }
  }

  // Get request by ID
  async getRequestById(req, res) {
    try {
      const { id } = req.params;

      const request = await FoodRequest.findById(id)
        .populate('recipient_id', 'name email phone')
        .populate('foodbank_id', 'name location phone');

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Request not found',
        });
      }

      // Check if user has permission to view this request
      if (req.user.role === 'recipient' && request.recipient_id._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      res.json({
        success: true,
        data: request,
      });
    } catch (error) {
      console.error('Error fetching request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch request',
        error: error.message,
      });
    }
  }

  // Update request status (admin/staff only)
  async updateRequestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const request = await FoodRequest.findById(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Request not found',
        });
      }

      request.status = status;
      if (notes) request.notes = notes;
      request.processed_by = req.user.id;
      request.processed_at = new Date();

      if (status === 'Fulfilled') {
        request.fulfilled_at = new Date();
      }

      await request.save();
      await request.populate('recipient_id', 'name email phone');
      await request.populate('foodbank_id', 'name location phone');

      res.json({
        success: true,
        message: 'Request status updated successfully',
        data: request,
      });
    } catch (error) {
      console.error('Error updating request status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update request status',
        error: error.message,
      });
    }
  }

  // Get request statistics
  async getRequestStats(req, res) {
    try {
      const { foodbank_id } = req.query;

      const filter = {};
      if (foodbank_id) filter.foodbank_id = foodbank_id;

      const stats = await FoodRequest.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const totalRequests = await FoodRequest.countDocuments(filter);

      res.json({
        success: true,
        data: {
          totalRequests,
          byStatus: stats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {}),
        },
      });
    } catch (error) {
      console.error('Error fetching request stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch request statistics',
        error: error.message,
      });
    }
  }
}

module.exports = new FoodRequestController();
