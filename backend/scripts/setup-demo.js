/* eslint-disable linebreak-style */
// backend/scripts/setupDemo.js
const mongoose = require('mongoose');
const FoodBank = require('../src/db/models/FoodBank');
const User = require('../src/db/models/User');
const Inventory = require('../src/db/models/Inventory');

const setupDemo = async () => {
  try {
    const mongoUri = 'mongodb+srv://yasharth77:1T8jOyEr3CzSSdKr@cluster0.eabzdc3.mongodb.net/ByteBasket?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🚀 Setting up demo data...');
    console.log('🔗 Using MongoDB URI: Atlas Connection');
    
    await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB connected successfully to ${mongoose.connection.name}`);
    console.log(`🔗 Connection string: ${mongoUri.split('@')[0]}@***`);
    
    // 🔧 FIX INDEXES FIRST - before clearing data
    console.log('\n🔧 Setting up proper indexes...');
    try {
      const inventoryCollection = mongoose.connection.db.collection('inventory');
      
      // Drop any existing problematic barcode indexes
      try {
        const indexes = await inventoryCollection.indexes();
        const barcodeIndexes = indexes.filter(idx => 
          idx.name.includes('barcode') && 
          idx.name !== '_id_' && 
          !idx.name.includes('partial_unique')
        );
        
        for (const idx of barcodeIndexes) {
          await inventoryCollection.dropIndex(idx.name);
          console.log(`✅ Dropped old index: ${idx.name}`);
        }
      } catch (error) {
        console.log('ℹ️ No old barcode indexes to drop');
      }

      // Create proper partial index for barcodes
      await inventoryCollection.createIndex(
        { barcode: 1, foodbank_id: 1 }, 
        { 
          unique: true,
          partialFilterExpression: { 
            // eslint-disable-next-line no-dupe-keys
            barcode: { $exists: true, $ne: null, $ne: '' } 
          },
          name: 'barcode_foodbank_partial_unique'
        }
      );
      console.log('✅ Created proper barcode partial index');
      
    } catch (error) {
      console.log('⚠️ Index setup warning:', error.message);
    }

    // Clear existing data
    console.log('\n🗑️ Clearing existing data...');
    await Promise.all([
      Inventory.deleteMany({}),
      FoodBank.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log('✅ Cleared existing data');

    // Create sample food banks
    console.log('\n🏢 Creating sample food banks...');
    const foodBanks = await FoodBank.create([
      {
        name: 'Downtown Food Bank',
        location: {
          address: '123 Main Street',
          city: 'Toronto',
          province: 'Ontario',
          postal_code: 'M5V 3A1',
          coordinates: { lat: 43.6426, lng: -79.3871 }
        },
        contact: {
          phone: '(416) 555-0123',
          email: 'info@downtownfoodbank.org',
          website: 'https://downtownfoodbank.org'
        },
        capacity: 1500,
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
          address: '456 Queen Street West',
          city: 'Toronto',
          province: 'Ontario',
          postal_code: 'M5V 2A2',
          coordinates: { lat: 43.6433, lng: -79.4000 }
        },
        contact: {
          phone: '(416) 555-0456',
          email: 'contact@communitycare.org'
        },
        capacity: 1200,
        operating_hours: {
          monday: { open: '08:00', close: '18:00' },
          tuesday: { open: '08:00', close: '18:00' },
          wednesday: { open: '08:00', close: '18:00' },
          thursday: { open: '08:00', close: '18:00' },
          friday: { open: '08:00', close: '18:00' },
          saturday: { open: '09:00', close: '16:00' },
          sunday: { open: '10:00', close: '14:00' }
        }
      }
    ]);
    console.log('✅ Created sample food banks');

    // Create sample users
    console.log('\n👥 Creating sample users...');
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: 'demo123',
        role: 'admin',
        foodbank_id: foodBanks[0]._id
      },
      {
        name: 'Staff Member',
        email: 'staff@demo.com', 
        password: 'demo123',
        role: 'staff',
        foodbank_id: foodBanks[0]._id
      },
      {
        name: 'Donor User',
        email: 'donor@demo.com',
        password: 'demo123', 
        role: 'donor'
      }
    ]);
    console.log('✅ Created sample users');

    // Create sample inventory items (with proper null barcode handling)
    console.log('\n📦 Creating sample inventory items...');
    const inventoryItems = [
      {
        foodbank_id: foodBanks[0]._id,
        item_name: 'Canned Beans (Black)',
        category: 'Canned Goods',
        quantity: 50,
        minimum_stock_level: 20,
        unit: 'cans',
        expiration_date: new Date('2025-12-31'),
        storage_location: 'Aisle 1, Shelf A',
        dietary_category: 'Vegan',
        // barcode: null (let it default to null)
        created_by: users[0]._id
      },
      {
        foodbank_id: foodBanks[0]._id,
        item_name: 'Rice (Brown, 1kg)',
        category: 'Grains',
        quantity: 8, // Low stock item
        minimum_stock_level: 15,
        unit: 'bags',
        storage_location: 'Aisle 2, Shelf C',
        dietary_category: 'Vegan',
        barcode: 'DEMO001', // This one has a barcode
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
        // barcode: null (let it default to null)
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
        barcode: 'DEMO002', // This one has a barcode
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
        // barcode: null (let it default to null)
        created_by: users[0]._id
      },
      {
        foodbank_id: foodBanks[1]._id,
        item_name: 'Canned Tomatoes',
        category: 'Canned Goods',
        quantity: 25,
        minimum_stock_level: 12,
        unit: 'cans',
        expiration_date: new Date('2026-01-15'),
        storage_location: 'Aisle 1, Shelf B',
        dietary_category: 'Vegan',
        // barcode: null (let it default to null)
        created_by: users[0]._id
      }
    ];
    
    // Insert items one by one to handle any potential issues
    console.log('📦 Inserting inventory items...');
    let successCount = 0;
    for (let i = 0; i < inventoryItems.length; i++) {
      try {
        await Inventory.create(inventoryItems[i]);
        console.log(`✅ Created item ${i + 1}: ${inventoryItems[i].item_name}`);
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
    console.log('\n📋 Demo Login Credentials:');
    console.log('Admin: admin@demo.com / demo123');
    console.log('Staff: staff@demo.com / demo123');
    console.log('Donor: donor@demo.com / demo123');
    console.log('\n🏢 Food Banks Created:');
    console.log('- Downtown Food Bank (Toronto)');
    console.log('- Community Care Center (Toronto)');
    console.log('\n📦 Sample Inventory Items: Including low stock and expiring items');
    
  } catch (error) {
    console.error('❌ Demo setup failed:', error);
    console.error('Error details:', error.message);
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