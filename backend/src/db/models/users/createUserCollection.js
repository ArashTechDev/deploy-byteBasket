

require('dotenv').config({ path: '../../../../.env' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = 'ByteBasket';

async function setup() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);

    // Create collection with schema validation
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['username', 'email', 'password', 'full_name', 'role'],
          properties: {
            username: { bsonType: 'string', description: 'must be a string and is required' },
            email: {
              bsonType: 'string',
              pattern: '^.+@.+\\..+$',
              description: 'must be a valid email and is required',
            },
            password: { bsonType: 'string', description: 'must be a string and is required' },
            full_name: { bsonType: 'string', description: 'must be a string and is required' },
            phone: { bsonType: ['string', 'null'], description: 'optional phone number' },
            role: {
              enum: ['Admin', 'Staff', 'Donor', 'Recipient', 'Volunteer'],
              description: 'must be one of the allowed roles',
            },
            created_at: { bsonType: 'date', description: 'auto-generated on insert' },
            last_login: { bsonType: ['date', 'null'], description: 'timestamp of last login' },
            dietary_restrictions: { bsonType: ['string', 'null'] },
            active: { bsonType: 'bool', description: 'whether the user is active' },
            verification_status: {
              bsonType: 'string',
              description: 'user verification state',
            },
          },
        },
      },
      validationLevel: 'strict',
      validationAction: 'error',
    });

    console.log('Collection "users" created with schema validation');

    // Add unique indexes
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });

    console.log('Unique indexes added to "username" and "email"');
  } catch (err) {
    console.error('Error setting up database:', err.message);
  } finally {
    await client.close();
  }
}

setup();
