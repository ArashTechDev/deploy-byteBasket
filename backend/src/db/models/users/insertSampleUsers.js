require('dotenv').config({ path: '../../../../.env' }); // Load .env from custom path
// insertUsers.js

const { MongoClient } = require('mongodb');

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not found in .env file");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db('ByteBasket');
    const usersCollection = db.collection('users');

    const users = [
      {
        username: "admin_john",
        email: "john.admin@bytebasket.org",
        password: "hashedpassword123",
        full_name: "John Admin",
        phone: "+1234567890",
        role: "Admin",
        created_at: new Date(),
        last_login: null,
        dietary_restrictions: "Vegan",
        active: true,
        verification_status: "Verified"
      },
      {
        username: "staff_anna",
        email: "anna.staff@bytebasket.org",
        password: "hashedpassword456",
        full_name: "Anna Staff",
        phone: "+1987654321",
        role: "Staff",
        created_at: new Date(),
        last_login: new Date(),
        dietary_restrictions: "Gluten-Free",
        active: true,
        verification_status: "Verified"
      },
      {
        username: "donor_lisa",
        email: "lisa.donor@bytebasket.org",
        password: "hashedpassword789",
        full_name: "Lisa Donor",
        phone: null,
        role: "Donor",
        created_at: new Date(),
        last_login: null,
        dietary_restrictions: null,
        active: true,
        verification_status: "Pending"
      }
    ];

    const result = await usersCollection.insertMany(users);
    console.log(`${result.insertedCount} users inserted.`);
  } catch (err) {
    console.error("Error inserting users:", err);
  } finally {
    await client.close();
  }
}

run();
