/* eslint-disable linebreak-style */
// backend/scripts/setup-demo.js
require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');

// IMPORTANT: Use the same User model as the auth system
const User = require('../src/db/models/User');
const FoodBank = require('../src/db/models/FoodBank');
const Inventory = require('../src/db/models/Inventory');

const setupDemo = async () => {
  try {
    // Use environment variable instead of hardcoded connection string
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in environment variables');
      console.error('   Please create a .env file based on .env.example');
      console.error('   Make sure MONGO_URI is properly set in your .env file');
      process.exit(1);
    }

    console.log('🚀 Setting up demo data...');
    console.log('🔗 Using MongoDB URI: Atlas Connection');

    // Connect with proper options
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGO_DB_NAME || 'ByteBasket',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connected successfully to ${mongoose.connection.name}`);
    console.log(`🔗 Connection string: ${mongoUri.split('@')[0]}@***`);

    // Clear existing demo data
    console.log('\n🧹 Clearing existing demo data...');
    await User.deleteMany({ email: { $regex: '@demo.com$' } });
    await FoodBank.deleteMany({ name: { $in: ['Downtown Food Bank', 'Community Care Center'] } });
    await Inventory.deleteMany({});

    console.log('\n🔧 Skipping index setup (will be handled by model definitions)...');

    // Create demo food banks first (needed for user foodbank_id references)
    console.log('\n🏢 Creating demo food banks...');
    const foodBanks = await FoodBank.create([
      {
        name: 'Downtown Food Bank',
        address: '123 Main Street',
        city: 'Toronto',
        province: 'Ontario',
        postalCode: 'M5V 1A1',
        contactEmail: 'contact@downtownfoodbank.org',
        contactPhone: '+1416555001',
        operatingHours: {
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: { open: '10:00', close: '14:00' },
          sunday: { open: 'closed', close: 'closed' },
        },
        latitude: 43.6426,
        longitude: -79.3871,
      },
      {
        name: 'Community Care Center',
        address: '456 Oak Avenue',
        city: 'Toronto',
        province: 'Ontario',
        postalCode: 'M4K 2L8',
        contactEmail: 'info@communitycare.org',
        contactPhone: '+1416555002',
        operatingHours: {
          monday: { open: '10:00', close: '18:00' },
          tuesday: { open: '10:00', close: '18:00' },
          wednesday: { open: '10:00', close: '18:00' },
          thursday: { open: '10:00', close: '18:00' },
          friday: { open: '10:00', close: '18:00' },
          saturday: { open: '09:00', close: '15:00' },
          sunday: { open: 'closed', close: 'closed' },
        },
        latitude: 43.6532,
        longitude: -79.3832,
      },
    ]);

    console.log(`✅ Created ${foodBanks.length} demo food banks`);

    // Now create demo users using the CORRECT schema (name, not full_name)
    console.log('\n👥 Creating demo users...');
    console.log('📋 Using User model schema that matches auth system...');

    const users = await User.create([
      {
        name: 'Demo Administrator', // ✅ Uses 'name' field (not full_name)
        email: 'admin@demo.com',
        password: 'demo123', // Will be hashed by pre-save middleware
        role: 'admin',
        foodbank_id: foodBanks[0]._id, // Required for admin role
        isActive: true,
        isVerified: true, // ✅ ENSURES NO EMAIL VERIFICATION NEEDED
      },
      {
        name: 'Demo Staff Member', // ✅ Uses 'name' field (not full_name)
        email: 'staff@demo.com',
        password: 'demo123', // Will be hashed by pre-save middleware
        role: 'staff',
        foodbank_id: foodBanks[1]._id, // Required for staff role
        isActive: true,
        isVerified: true, // ✅ ENSURES NO EMAIL VERIFICATION NEEDED
      },
      {
        name: 'Demo Donor', // ✅ Uses 'name' field (not full_name)
        email: 'donor@demo.com',
        password: 'demo123', // Will be hashed by pre-save middleware
        role: 'donor',
        // foodbank_id not required for donor role
        isActive: true,
        isVerified: true, // ✅ ENSURES NO EMAIL VERIFICATION NEEDED
      },
      {
        name: 'Demo Recipient', // ✅ Uses 'name' field (not full_name)
        email: 'recipient@demo.com',
        password: 'demo123', // Will be hashed by pre-save middleware
        role: 'recipient',
        phone: '+1416555123',
        // foodbank_id not required for recipient role
        dietary_restrictions: ['Vegetarian', 'Gluten-Free'], // ✅ Common dietary restrictions
        isActive: true,
        isVerified: true, // ✅ ENSURES NO EMAIL VERIFICATION NEEDED
      },
    ]);

    console.log(`✅ Created ${users.length} demo users`);

    // Verify that users were created with isVerified: true
    console.log('\n🔍 Verifying demo user verification status...');
    for (const user of users) {
      console.log(`   ${user.email} - Verified: ${user.isVerified} - Role: ${user.role}`);
      if (user.role === 'recipient') {
        console.log(
          `   ${user.email} - Dietary Restrictions: ${user.dietary_restrictions.join(', ')}`
        );
      }
    }

    // Update food banks with manager IDs
    console.log('\n🔄 Updating food bank managers...');
    await FoodBank.findByIdAndUpdate(foodBanks[0]._id, { manager_id: users[0]._id });
    await FoodBank.findByIdAndUpdate(foodBanks[1]._id, { manager_id: users[1]._id });

    // Create sample inventory items (including items that match recipient dietary restrictions)
    console.log('\n📦 Creating sample inventory items...');
    const inventoryItems = [
      {
        foodbank_id: foodBanks[0]._id,
        item_name: 'Canned Beans',
        category: 'Canned Goods',
        quantity: 5, // Low stock to trigger alert
        minimum_stock_level: 10,
        unit: 'cans',
        expiration_date: new Date('2025-12-31'),
        storage_location: 'Aisle 1, Shelf A',
        dietary_category: 'Vegan', // ✅ Matches recipient preferences (Vegetarian includes Vegan)
        barcode: 'DEMO001',
        created_by: users[0]._id,
      },
      {
        foodbank_id: foodBanks[0]._id,
        item_name: 'Gluten-Free Pasta',
        category: 'Grains',
        quantity: 15,
        minimum_stock_level: 8,
        unit: 'boxes',
        expiration_date: new Date('2026-03-15'),
        storage_location: 'Aisle 2, Shelf A',
        dietary_category: 'Gluten-Free', // ✅ Matches recipient dietary restrictions
        barcode: 'DEMO002',
        created_by: users[0]._id,
      },
      {
        foodbank_id: foodBanks[0]._id,
        item_name: 'Organic Vegetable Soup',
        category: 'Canned Goods',
        quantity: 8,
        minimum_stock_level: 6,
        unit: 'cans',
        expiration_date: new Date('2025-08-30'),
        storage_location: 'Aisle 1, Shelf B',
        dietary_category: 'Vegetarian', // ✅ Matches recipient dietary restrictions
        barcode: 'DEMO003',
        created_by: users[0]._id,
      },
      {
        foodbank_id: foodBanks[1]._id,
        item_name: 'Rice (Brown)',
        category: 'Grains',
        quantity: 25,
        minimum_stock_level: 10,
        unit: 'bags',
        storage_location: 'Dry Goods',
        dietary_category: 'Gluten-Free', // ✅ Suitable for recipient
        created_by: users[1]._id,
      },
      {
        foodbank_id: foodBanks[1]._id,
        item_name: 'Canned Tomatoes',
        category: 'Canned Goods',
        quantity: 20,
        minimum_stock_level: 12,
        unit: 'cans',
        expiration_date: new Date('2026-01-15'),
        storage_location: 'Aisle 1, Shelf B',
        dietary_category: 'Vegan', // ✅ Suitable for vegetarian recipient
        created_by: users[1]._id,
      },
      {
        foodbank_id: foodBanks[1]._id,
        item_name: 'Almond Milk',
        category: 'Dairy Alternatives',
        quantity: 12,
        minimum_stock_level: 8,
        unit: 'cartons',
        expiration_date: new Date('2025-09-15'),
        storage_location: 'Refrigerator B',
        dietary_category: 'Vegan', // ✅ Perfect for vegetarian recipient
        barcode: 'DEMO004',
        created_by: users[1]._id,
      },
    ];

    // Insert items one by one to handle any potential issues
    console.log('📦 Inserting inventory items...');
    let successCount = 0;
    for (let i = 0; i < inventoryItems.length; i++) {
      try {
        await Inventory.create(inventoryItems[i]);
        console.log(
          `✅ Created item ${i + 1}: ${inventoryItems[i].item_name} (${
            inventoryItems[i].dietary_category
          })`
        );
        successCount++;
      } catch (error) {
        console.log(`⚠️ Skipped item ${i + 1} (${inventoryItems[i].item_name}): ${error.message}`);
      }
    }

    // Update food bank inventory counts
    console.log('\n📊 Updating food bank statistics...');
    for (const foodBank of foodBanks) {
      const count = await Inventory.countDocuments({ foodbank_id: foodBank._id });
      await FoodBank.findByIdAndUpdate(foodBank._id, { current_inventory_count: count });
    }

    console.log('\n🎉 Demo setup completed successfully!');
    console.log(`📦 Successfully created ${successCount} inventory items`);
    console.log('\n📋 Demo Login Credentials (ALL PRE-VERIFIED):');
    console.log('Admin: admin@demo.com / demo123');
    console.log('Staff: staff@demo.com / demo123');
    console.log('Donor: donor@demo.com / demo123');
    console.log('🆕 Recipient: recipient@demo.com / demo123');
    console.log('\n🏢 Food Banks Created:');
    console.log('- Downtown Food Bank (Toronto)');
    console.log('- Community Care Center (Toronto)');
    console.log(
      '\n📦 Sample Inventory Items: Including items suitable for recipient dietary restrictions'
    );
    console.log('🥗 Dietary-Friendly Items Created:');
    console.log(
      '   - Vegetarian: Organic Vegetable Soup, Canned Beans, Canned Tomatoes, Almond Milk'
    );
    console.log('   - Gluten-Free: Gluten-Free Pasta, Brown Rice');
    console.log('   - Vegan Options: Canned Beans, Canned Tomatoes, Almond Milk');
    console.log('\n👤 Recipient User Profile:');
    console.log('   - Name: Demo Recipient');
    console.log('   - Email: recipient@demo.com');
    console.log('   - Phone: +1416555123');
    console.log('   - Dietary Restrictions: Vegetarian, Gluten-Free');
    console.log('   - Status: Active & Pre-verified');
    console.log('\n✅ All demo accounts are pre-verified and ready to use!');
    console.log('🎯 Recipient can now request food items that match their dietary restrictions');
  } catch (error) {
    console.error('❌ Demo setup failed:', error);
    console.error('Error details:', error.message);

    // Provide specific error guidance
    if (error.message.includes('authentication') || error.message.includes('bad auth')) {
      console.error('\n🔑 Authentication Error - Possible solutions:');
      console.error('   1. Check your MongoDB Atlas username and password in .env');
      console.error('   2. Verify your MongoDB Atlas cluster is running');
      console.error('   3. Check if your IP address is whitelisted in MongoDB Atlas');
      console.error('   4. Ensure your MongoDB Atlas user has proper permissions');
    }

    if (error.message.includes('validation failed')) {
      console.error('\n📋 Schema Validation Error:');
      console.error('   The User model requires specific fields.');
      console.error('   Current script uses the User.js model which requires:');
      console.error('   - name (not full_name)');
      console.error('   - email');
      console.error('   - password');
      console.error('   - role');
    }

    process.exit(1);
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
