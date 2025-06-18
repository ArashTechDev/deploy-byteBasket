// backend/src/api/routes/inventory.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const csv = require('fast-csv');
const ExcelJS = require('exceljs');

// Database connection (using your existing setup)
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'bytebasket',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Helper function to check low stock
const checkLowStock = (quantity, minimumStockLevel) => {
  return quantity <= (minimumStockLevel || 10);
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
      low_stock_only,
      sort_by = 'date_added',
      sort_order = 'DESC',
      page = 1,
      limit = 20,
      export_format
    } = req.query;

    let query = `
      SELECT i.*, f.name as foodbank_name 
      FROM inventory i 
      LEFT JOIN foodbanks f ON i.foodbank_id = f.foodbank_id 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Search functionality
    if (search) {
      query += ` AND (LOWER(i.item_name) LIKE LOWER($${paramIndex}) OR LOWER(i.category) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Category filter
    if (category) {
      query += ` AND LOWER(i.category) = LOWER($${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    // Dietary category filter
    if (dietary_category) {
      query += ` AND i.dietary_category = $${paramIndex}`;
      params.push(dietary_category);
      paramIndex++;
    }

    // Food bank filter
    if (foodbank_id) {
      query += ` AND i.foodbank_id = $${paramIndex}`;
      params.push(foodbank_id);
      paramIndex++;
    }

    // Storage location filter
    if (location) {
      query += ` AND LOWER(i.storage_location) LIKE LOWER($${paramIndex})`;
      params.push(`%${location}%`);
      paramIndex++;
    }

    // Expiring soon filter (next 7 days)
    if (expiring_soon === 'true') {
      query += ` AND i.expiration_date <= CURRENT_DATE + INTERVAL '7 days' AND i.expiration_date >= CURRENT_DATE`;
    }

    // Low stock filter
    if (low_stock_only === 'true') {
      query += ` AND i.quantity <= i.minimum_stock_level`;
    }

    // Count query for pagination
    const countQuery = query.replace('SELECT i.*, f.name as foodbank_name', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const totalItems = parseInt(countResult.rows[0].count);

    // Sorting
    const validSortColumns = ['item_name', 'category', 'quantity', 'expiration_date', 'date_added'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'date_added';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY i.${sortColumn} ${sortDirection}`;

    // Handle export
    if (export_format) {
      const result = await pool.query(query, params);
      
      if (export_format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
        
        const csvStream = csv.format({ headers: true });
        csvStream.pipe(res);
        
        result.rows.forEach(row => {
          csvStream.write({
            'Item Name': row.item_name,
            'Category': row.category,
            'Quantity': row.quantity,
            'Expiration Date': row.expiration_date,
            'Storage Location': row.storage_location,
            'Dietary Category': row.dietary_category,
            'Food Bank': row.foodbank_name,
            'Date Added': row.date_added
          });
        });
        
        csvStream.end();
        return;
      }
      
      if (export_format === 'excel') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventory');
        
        worksheet.columns = [
          { header: 'Item Name', key: 'item_name', width: 20 },
          { header: 'Category', key: 'category', width: 15 },
          { header: 'Quantity', key: 'quantity', width: 10 },
          { header: 'Expiration Date', key: 'expiration_date', width: 15 },
          { header: 'Storage Location', key: 'storage_location', width: 15 },
          { header: 'Dietary Category', key: 'dietary_category', width: 15 },
          { header: 'Food Bank', key: 'foodbank_name', width: 20 },
          { header: 'Date Added', key: 'date_added', width: 15 }
        ];
        
        worksheet.addRows(result.rows);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=inventory.xlsx');
        
        await workbook.xlsx.write(res);
        return;
      }
    }

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    // Update low_stock flag for returned items
    const inventoryItems = result.rows.map(item => ({
      ...item,
      low_stock: checkLowStock(item.quantity, item.minimum_stock_level),
      is_expiring_soon: item.expiration_date && 
        new Date(item.expiration_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }));

    res.json({
      items: inventoryItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/inventory/:id - Get single inventory item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT i.*, f.name as foodbank_name 
      FROM inventory i 
      LEFT JOIN foodbanks f ON i.foodbank_id = f.foodbank_id 
      WHERE i.inventory_id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    const item = result.rows[0];
    item.low_stock = checkLowStock(item.quantity, item.minimum_stock_level);
    item.is_expiring_soon = item.expiration_date && 
      new Date(item.expiration_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    res.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      minimum_stock_level
    } = req.body;

    // Validation
    if (!foodbank_id || !item_name || !category || quantity === undefined) {
      return res.status(400).json({ 
        error: 'Required fields: foodbank_id, item_name, category, quantity' 
      });
    }

    const low_stock = checkLowStock(quantity, minimum_stock_level);

    const query = `
      INSERT INTO inventory (
        foodbank_id, item_name, category, quantity, expiration_date,
        storage_location, dietary_category, barcode, minimum_stock_level, low_stock
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      foodbank_id, item_name, category, quantity, expiration_date || null,
      storage_location || null, dietary_category || null, barcode || null,
      minimum_stock_level || 10, low_stock
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error creating inventory item:', error);
    if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Invalid foodbank_id' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT /api/inventory/:id - Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      foodbank_id,
      item_name,
      category,
      quantity,
      expiration_date,
      storage_location,
      dietary_category,
      barcode,
      minimum_stock_level
    } = req.body;

    // Check if item exists
    const existingItem = await pool.query('SELECT * FROM inventory WHERE inventory_id = $1', [id]);
    if (existingItem.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const low_stock = checkLowStock(quantity, minimum_stock_level);

    const query = `
      UPDATE inventory SET
        foodbank_id = $1,
        item_name = $2,
        category = $3,
        quantity = $4,
        expiration_date = $5,
        storage_location = $6,
        dietary_category = $7,
        barcode = $8,
        minimum_stock_level = $9,
        low_stock = $10
      WHERE inventory_id = $11
      RETURNING *
    `;

    const values = [
      foodbank_id, item_name, category, quantity, expiration_date || null,
      storage_location || null, dietary_category || null, barcode || null,
      minimum_stock_level || 10, low_stock, id
    ];

    const result = await pool.query(query, values);
    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating inventory item:', error);
    if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Invalid foodbank_id' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// DELETE /api/inventory/:id - Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM inventory WHERE inventory_id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json({ message: 'Inventory item deleted successfully', item: result.rows[0] });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/inventory/alerts/low-stock - Get low stock alerts
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const query = `
      SELECT i.*, f.name as foodbank_name 
      FROM inventory i 
      LEFT JOIN foodbanks f ON i.foodbank_id = f.foodbank_id 
      WHERE i.quantity <= i.minimum_stock_level
      ORDER BY i.quantity ASC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/inventory/alerts/expiring - Get expiring items alerts
router.get('/alerts/expiring', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const query = `
      SELECT i.*, f.name as foodbank_name 
      FROM inventory i 
      LEFT JOIN foodbanks f ON i.foodbank_id = f.foodbank_id 
      WHERE i.expiration_date <= CURRENT_DATE + INTERVAL '${days} days' 
      AND i.expiration_date >= CURRENT_DATE
      ORDER BY i.expiration_date ASC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expiring items alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/inventory/categories - Get all unique categories
router.get('/meta/categories', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT category FROM inventory ORDER BY category';
    const result = await pool.query(query);
    res.json(result.rows.map(row => row.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/inventory/dietary-categories - Get dietary category enums
router.get('/meta/dietary-categories', async (req, res) => {
  try {
    const query = `
      SELECT unnest(enum_range(NULL::dietary_category_enum)) as dietary_category
    `;
    const result = await pool.query(query);
    res.json(result.rows.map(row => row.dietary_category));
  } catch (error) {
    console.error('Error fetching dietary categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;