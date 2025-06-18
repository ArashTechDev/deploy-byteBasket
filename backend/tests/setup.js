// backend/tests/setup.js
const { Pool } = require('pg');

// Setup test database connection
const testPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'bytebasket_test',
  password: process.env.DB_PASSWORD || 'testpassword',
  port: process.env.DB_PORT || 5432,
});

// Global test setup
beforeAll(async () => {
  // Ensure test database is clean
  await testPool.query('DELETE FROM inventory');
  await testPool.query('DELETE FROM donations');
  await testPool.query('DELETE FROM food_requests');
  
  // Insert test data if needed
  await testPool.query(`
    INSERT INTO foodbanks (foodbank_id, name, address, city, state, zip, phone, email, opening_hours, closing_hours)
    VALUES (1, 'Test Food Bank', '123 Test St', 'Test City', 'TS', '12345', '555-0123', 'test@foodbank.com', '09:00', '17:00')
    ON CONFLICT (foodbank_id) DO NOTHING
  `);
  
  await testPool.query(`
    INSERT INTO users (user_id, username, email, password, full_name, role)
    VALUES (1, 'testuser', 'test@example.com', '$2a$10$test', 'Test User', 'Staff')
    ON CONFLICT (user_id) DO NOTHING
  `);
});

// Global test teardown
afterAll(async () => {
  await testPool.end();
});

// Clean up after each test
afterEach(async () => {
  await testPool.query('DELETE FROM inventory WHERE inventory_id > 1000'); // Keep seed data
});

module.exports = { testPool };