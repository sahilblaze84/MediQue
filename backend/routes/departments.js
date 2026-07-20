const express = require('express');
const router = express.Router();
const { query, get } = require('../utils/database');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all departments
router.get('/', asyncHandler(async (req, res) => {
  const departments = await query('SELECT * FROM departments ORDER BY name');
  res.json(departments);
}));

// Get department by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const department = await get('SELECT * FROM departments WHERE id = ?', [req.params.id]);
  
  if (!department) {
    return res.status(404).json({ error: 'Department not found' });
  }
  
  res.json(department);
}));

// Get doctors in a department
router.get('/:id/doctors', asyncHandler(async (req, res) => {
  const doctors = await query(
    'SELECT * FROM doctors WHERE department_id = ? ORDER BY name',
    [req.params.id]
  );
  
  res.json(doctors);
}));

module.exports = router;
