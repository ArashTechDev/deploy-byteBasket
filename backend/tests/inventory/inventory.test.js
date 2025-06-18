// backend/tests/inventory.test.js
const request = require('supertest');
const app = require('../server');
const pool = require('../src/config/database');

describe('Inventory API', () => {
  let authToken;
  let testItem;

  beforeAll(async () => {
    // Setup test database and auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'testpass' });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/inventory', () => {
    it('should create a new inventory item', async () => {
      const itemData = {
        foodbank_id: 1,
        item_name: 'Test Item',
        category: 'Test Category',
        quantity: 50,
        minimum_stock_level: 10
      };

      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body).toHaveProperty('inventory_id');
      expect(response.body.item_name).toBe(itemData.item_name);
      testItem = response.body;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toContain('Required fields');
    });
  });

  describe('GET /api/inventory', () => {
    it('should fetch inventory with pagination', async () => {
      const response = await request(app)
        .get('/api/inventory?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/inventory?category=Test Category')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.items.forEach(item => {
        expect(item.category).toBe('Test Category');
      });
    });

    it('should search by item name', async () => {
      const response = await request(app)
        .get('/api/inventory?search=Test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/inventory/:id', () => {
    it('should update an inventory item', async () => {
      const updatedData = {
        ...testItem,
        quantity: 25
      };

      const response = await request(app)
        .put(`/api/inventory/${testItem.inventory_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.quantity).toBe(25);
    });
  });

  describe('DELETE /api/inventory/:id', () => {
    it('should delete an inventory item', async () => {
      await request(app)
        .delete(`/api/inventory/${testItem.inventory_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app)
        .get(`/api/inventory/${testItem.inventory_id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/inventory/alerts/low-stock', () => {
    it('should fetch low stock alerts', async () => {
      const response = await request(app)
        .get('/api/inventory/alerts/low-stock')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});