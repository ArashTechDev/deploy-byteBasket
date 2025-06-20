const path = require('path');
const envPath = path.resolve(__dirname, '../../../.env');

console.log('📄 Loading .env from:', envPath);

require('dotenv').config({ path: envPath });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = 'ByteBasket';

async function setupDonations() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);

    await db.createCollection('donations', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['donor_id', 'foodbank_id', 'status'],
          properties: {
            donor_id: {
              bsonType: 'objectId',
              description: 'must be an ObjectId referencing a user (donor)',
            },
            foodbank_id: {
              bsonType: 'objectId',
              description: 'must be an ObjectId referencing a foodbank',
            },
            donation_date: {
              bsonType: 'date',
              description: 'timestamp when the donation was made',
            },
            status: {
              enum: ['Scheduled', 'Received', 'Processed'],
              description: 'must be a valid donation status',
            },
            receipt_generated: {
              bsonType: 'bool',
              description: 'flag indicating whether a receipt was generated',
            },
            notes: {
              bsonType: ['string', 'null'],
              description: 'optional notes from the donor',
            },
            scheduled_dropoff: {
              bsonType: ['date', 'null'],
              description: 'optional scheduled drop-off timestamp',
            },
          },
        },
      },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    console.log('Collection "donations" created with schema validation');
  } catch (err) {
    console.error('Error setting up donations collection:', err.message);
  } finally {
    await client.close();
  }
}

setupDonations();
