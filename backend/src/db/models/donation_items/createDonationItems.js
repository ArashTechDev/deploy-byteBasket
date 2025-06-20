require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = 'ByteBasket';

async function setupDonationItems() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);

    await db.createCollection('donation_items', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['donation_id', 'item_name', 'quantity', 'category'],
          properties: {
            donation_id: {
              bsonType: 'objectId',
              description: 'Reference to donations._id',
            },
            inventory_id: {
              bsonType: ['objectId', 'null'],
              description: 'Optional reference to inventory._id',
            },
            item_name: {
              bsonType: 'string',
              description: 'Name of the donated item',
            },
            quantity: {
              bsonType: 'int',
              minimum: 1,
              description: 'Quantity donated',
            },
            expiration_date: {
              bsonType: ['date', 'null'],
              description: 'Optional expiration date',
            },
            category: {
              enum: ['Canned', 'Dry', 'Fresh', 'Personal'],
              description: 'Category of the donated item',
            },
            dietary_info: {
              bsonType: ['string', 'null'],
              description: 'Optional dietary details or notes',
            },
          },
        },
      },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    console.log('Collection "donation_items" created with schema validation');
  } catch (err) {
    console.error('Error creating "donation_items" collection:', err.message);
  } finally {
    await client.close();
  }
}

setupDonationItems();
