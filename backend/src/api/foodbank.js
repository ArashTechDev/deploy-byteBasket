const express = require('express');
const router = express.Router();
const db = require('../models'); 
const { FoodBank } = db;
const geocodeAddress = require('../utils/geocodeAddress');
const { validateCreateFoodBank, validateUpdateFoodBank } = require('../middleware/validateFoodBank');

// GET all food banks
router.get('/', async (req, res) => {
  const list = await FoodBank.findAll();
  res.json(list);
});

// GET single food bank
router.get('/:id', async (req, res) => {
  const item = await FoodBank.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// CREATE new food bank
router.post('/', validateCreateFoodBank, async (req, res) => {
  const { name, address, city, province, postalCode, contactEmail, contactPhone, operatingHours } = req.body;
  const fullAddress = `${address}, ${city}, ${province}, ${postalCode}`;
  const { latitude, longitude } = await geocodeAddress(fullAddress);
  const newFB = await FoodBank.create({
    name, address, city, province, postalCode, contactEmail, contactPhone, operatingHours, latitude, longitude
  });
  res.status(201).json(newFB);
});

// UPDATE food bank
router.put('/:id', validateUpdateFoodBank, async (req, res) => {
  const foodBank = await FoodBank.findByPk(req.params.id);
  if (!foodBank) return res.status(404).json({ error: 'Not found' });

  const updatedFields = { ...req.body };
  const needsGeocode = updatedFields.address || updatedFields.city || updatedFields.province || updatedFields.postalCode;

  if (needsGeocode) {
    const fullAddress = `${updatedFields.address || foodBank.address}, ${updatedFields.city || foodBank.city}, ${updatedFields.province || foodBank.province}, ${updatedFields.postalCode || foodBank.postalCode}`;
    const { latitude, longitude } = await geocodeAddress(fullAddress);
    updatedFields.latitude = latitude;
    updatedFields.longitude = longitude;
  }

  await foodBank.update(updatedFields);
  res.json(foodBank);
});

// DELETE food bank
router.delete('/:id', async (req, res) => {
  const foodBank = await FoodBank.findByPk(req.params.id);
  if (!foodBank) return res.status(404).json({ error: 'Not found' });
  await foodBank.destroy();
  res.status(204).send();
});

module.exports = router;
