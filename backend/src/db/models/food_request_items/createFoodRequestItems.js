require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = 'ByteBasket';

async function setupFoodRequestItems() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);

    await db.createCollection('food_request_items', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['request_id', 'inventory_id', 'item_name', 'quantity_requested'],
          properties: {
            request_id: {
              bsonType: 'objectId',
              description: 'Reference to food_requests._id',
            },
            inventory_id: {
              bsonType: 'objectId',
              description: 'Reference to inventory._id',
            },
            item_name: {
              bsonType: 'string',
              description: 'Name of the requested item',
            },
            quantity_requested: {
              bsonType: 'int',
              minimum: 1,
              description: 'Number of items requested',
            },
            quantity_fulfilled: {
              bsonType: 'int',
              minimum: 0,
              description: 'How many items were actually fulfilled',
            },
          },
        },
      },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    console.log('Collection "food_request_items" created with schema validation');
  } catch (err) {
    console.error('Error creating "food_request_items" collection:', err.message);
  } finally {
    await client.close();
  }
}

setupFoodRequestItems();
