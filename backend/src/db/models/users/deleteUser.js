require('dotenv').config({ path: '../../../../.env' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = 'ByteBasket';

async function deleteUser(username) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const result = await db.collection('users').deleteOne({ username });

    if (result.deletedCount === 1) {
      console.log(`User "${username}" deleted successfully.`);
    } else {
      console.log(`User "${username}" not found.`);
    }
  } catch (err) {
    console.error('Error deleting user:', err.message);
  } finally {
    await client.close();
  }
}

// Example usage
deleteUser('arash');
