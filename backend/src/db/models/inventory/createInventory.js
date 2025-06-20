
require('dotenv').config({ path: '../../../../.env' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = 'ByteBasket';

async function setupInventory() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);

    // Create 'inventory' collection with schema validation
    await db.createCollection('inventory', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['foodbank_id', 'item_name', 'category', 'quantity'],
          properties: {
            foodbank_id: {
              bsonType: 'objectId',
              description: 'must be an ObjectId referencing a foodbank',
            },
            item_name: {
              bsonType: 'string',
              description: 'name of the item - required string',
            },
            category: {
              bsonType: 'string',
              description: 'item category - required string',
            },
            quantity: {
              bsonType: 'int',
              minimum: 0,
              description: 'number of units - required non-negative integer',
            },
            expiration_date: {
              bsonType: ['date', 'null'],
              description: 'optional expiration date',
            },
            storage_location: {
              bsonType: ['string', 'null'],
              description: 'optional storage location string',
            },
            dietary_category: {
              enum: ['Vegan', 'Vegetarian', 'Gluten-Free', 'Kosher', 'Halal', null],
              description: 'must match a known dietary category or be null',
            },
            date_added: {
              bsonType: 'date',
              description: 'auto-generated timestamp when added',
            },
            barcode: {
              bsonType: ['string', 'null'],
              description: 'optional barcode string',
            },
            low_stock: {
              bsonType: 'bool',
              description: 'boolean flag for low stock alert',
            },
            minimum_stock_level: {
              bsonType: 'int',
              minimum: 0,
              description: 'threshold for low stock warning',
            },
          },
        },
      },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    console.log('Collection "inventory" created with schema validation');
  } catch (err) {
    console.error('Error setting up inventory collection:', err.message);
  } finally {
    await client.close();
  }
}

setupInventory();
