/* eslint-disable linebreak-style */
// backend/scripts/setup-demo.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Fixed path to .env
const mongoose = require('mongoose');

const { connectMongoDB } = require('../src/config/mongodb');
const FoodBank = require('../src/db/models/foodbanks/FoodBank');
const User = require('../src/db/models/users/User');
const Inventory = require('../src/db/models/inventory/Inventory');
const bcrypt = require('bcryptjs');

const setupDemo = async () => {
  try {
    console.log('🚀 Setting up demo data...');
    console.log('🔗 Using MongoDB URI:', process.env.MONGO_URI ? 'Atlas Connection' : 'Local Connection');
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Clear existing data (for demo purposes)
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      FoodBank.deleteMany({}),
      User.deleteMany({}),
      Inventory.deleteMany({})
    ]);
    
    console.log('✅ Cleared existing data');
    
    // Create sample food banks
    console.log('🏢 Creating sample food banks...');
    const foodBanks = await FoodBank.create([
      {
        name: 'Downtown Food Bank',
        location: {
          address: '123 Main Street',
          city: 'Toronto',
          province: 'Ontario',
          postal_code: 'M5V 1A1',
          coordinates: { lat: 43.6426, lng: -79.3871 }
        },
        contact: {
          phone: '416-555-0001',
          email: 'info@downtownfoodbank.org'
        },
        operating_hours: {
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: { open: '10:00', close: '15:00' },
          sunday: { open: 'closed', close: 'closed' }
        }
      },
      {
        name: 'Community Care Center',
        location: {
          address: '456 Oak Avenue',
          city: 'Toronto',
          province: 'Ontario',
          postal_code: 'M4E 2B8',
          coordinates: { lat: 43.6532, lng: -79.3832 }
        },
        contact: {
          phone: '416-555-0002',
          email: 'help@communitycare.org'
        }
      }
    ]);
    
    console.log('✅ Created sample food banks');
    
    // Create sample users
    console.log('👥 Creating sample users...');
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: hashedPassword,
        role: 'admin',
        foodbank_id: foodBanks[0]._id,
        isVerified: true
      },
      {
        name: 'Staff Member',
        email: 'staff@demo.com',
        password: hashedPassword,
        role: 'staff',
        foodbank_id: foodBanks[0]._id,
        isVerified: true
      },
      {
        name: 'John Donor',
        email: 'donor@demo.com',
        password: hashedPassword,
        role: 'donor',
        isVerified: true
      }
    ]);
    
    console.log('✅ Created sample users');
    
    // Create sample inventory items
    console.log('📦 Creating sample inventory items...');
    const inventoryItems = [
      {
        foodbank_id: foodBanks[0]._id,
        item_name: 'Canned Tomatoes',
        category: 'Canned Goods',
        quantity: 50,
        minimum_stock_level: 10,
        unit: 'cans',
        expiration_date: new Date('2025-12-31'),
        storage_location: 'Shelf A1',
        dietary_category: 'Vegan',
        created_by: users[0]._id
      },
      {
        foodbank_id: foodBanks[0]._id,
        item_name: 'Rice (White)',
        category: 'Grains',
        quantity: 25,
        minimum_stock_level: 15,
        unit: 'kg',
        storage_location: 'Storage Room B',
        dietary_category: 'Vegan',
        created_by: users[0]._id
      },
      {
        foodbank_id: foodBanks[0]._id,
        item_name: 'Chicken Breast (Frozen)',
        category: 'Meat',
        quantity: 8, // Low stock for demo
        minimum_stock_level: 10,
        unit: 'packages',
        expiration_date: new Date('2025-08-15'),
        storage_location: 'Freezer C',
        created_by: users[1]._id
      },
      {
        foodbank_id: foodBanks[0]._id,
        item_name: 'Bread (Whole Wheat)',
        category: 'Bakery',
        quantity: 15,
        minimum_stock_level: 5,
        unit: 'loaves',
        expiration_date: new Date('2025-06-25'), // Expiring soon
        storage_location: 'Bread Section',
        created_by: users[1]._id
      },
      {
        foodbank_id: foodBanks[0]._id,
        item_name: 'Milk (2%)',
        category: 'Dairy',
        quantity: 12,
        minimum_stock_level: 8,
        unit: 'cartons',
        expiration_date: new Date('2025-06-30'),
        storage_location: 'Refrigerator A',
        dietary_category: 'Vegetarian',
        created_by: users[0]._id
      },
      {
        foodbank_id: foodBanks[1]._id,
        item_name: 'Pasta (Whole Grain)',
        category: 'Grains',
        quantity: 30,
        minimum_stock_level: 10,
        unit: 'boxes',
        storage_location: 'Dry Goods',
        dietary_category: 'Vegan',
        created_by: users[0]._id
      }
    ];
    
    await Inventory.create(inventoryItems);
    console.log('✅ Created sample inventory items');
    
    // Update food bank inventory counts
    console.log('📊 Updating food bank statistics...');
    for (const foodBank of foodBanks) {
      const count = await Inventory.countDocuments({ foodbank_id: foodBank._id });
      await FoodBank.findByIdAndUpdate(foodBank._id, { current_inventory_count: count });
    }
    
    console.log('✅ Demo setup completed successfully!');
    console.log('\n📋 Demo Login Credentials:');
    console.log('Admin: admin@demo.com / demo123');
    console.log('Staff: staff@demo.com / demo123');
    console.log('Donor: donor@demo.com / demo123');
    console.log('\n🏢 Food Banks Created:');
    console.log('- Downtown Food Bank (Toronto)');
    console.log('- Community Care Center (Toronto)');
    console.log('\n📦 Sample Inventory Items: 6 items created');
    console.log('- Including low stock items and expiring items for demo');
    
  } catch (error) {
    console.error('❌ Demo setup failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
};

// Run setup if called directly
if (require.main === module) {
  setupDemo();
}

module.exports = setupDemo;