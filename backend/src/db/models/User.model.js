const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '../../../../.env' });

const uri = process.env.MONGO_URI;
const dbName = 'ByteBasket';
const collectionName = 'users';

// Helper to connect and get the collection
async function getUserCollection() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  return { collection, client };
}

// CREATE
async function createUser(userData) {
  const { collection, client } = await getUserCollection();
  try {
    userData.created_at = new Date();
    userData.active = true;

    const result = await collection.insertOne(userData);
    return result.insertedId;
  } catch (err) {
    throw new Error('Create user failed: ' + err.message);
  } finally {
    await client.close();
  }
}

// READ
async function getUserById(userId) {
  const { collection, client } = await getUserCollection();
  try {
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    return user;
  } catch (err) {
    throw new Error('Get user failed: ' + err.message);
  } finally {
    await client.close();
  }
}

// UPDATE
async function updateUser(userId, updates) {
  const { collection, client } = await getUserCollection();
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updates }
    );
    return result.modifiedCount > 0;
  } catch (err) {
    throw new Error('Update user failed: ' + err.message);
  } finally {
    await client.close();
  }
}

// DELETE
async function deleteUser(userId) {
  const { collection, client } = await getUserCollection();
  try {
    const result = await collection.deleteOne({ _id: new ObjectId(userId) });
    return result.deletedCount > 0;
  } catch (err) {
    throw new Error('Delete user failed: ' + err.message);
  } finally {
    await client.close();
  }
}

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
