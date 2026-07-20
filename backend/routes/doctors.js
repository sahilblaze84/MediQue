const express = require('express');
const router = express.Router();
const { query, get, run } = require('../utils/database');
const { validateDoctorCreation } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all doctors
router.get('/', asyncHandler(async (req, res) => {
  const { departmentId } = req.query;

  let sql = `
    SELECT d.*, dept.name as department_name 
    FROM doctors d
    JOIN departments dept ON d.department_id = dept.id
  `;

  const params = [];

  if (departmentId) {
    sql += ' WHERE d.department_id = ?';
    params.push(departmentId);
  }

  sql += ' ORDER BY d.name';

  const doctors = await query(sql, params);
  res.json(doctors);
}));

// Get doctor by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const doctor = await get(
    `SELECT d.*, dept.name as department_name 
    FROM doctors d
    JOIN departments dept ON d.department_id = dept.id
    WHERE d.id = ?`,
    [req.params.id]
  );
  
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  
  res.json(doctor);
}));

// Create new doctor
router.post('/', validateDoctorCreation, asyncHandler(async (req, res) => {
  const { name, email, phone, departmentId, specialization, availableFrom, availableTo } = req.body;

  const result = await run(
    `INSERT INTO doctors (name, email, phone, department_id, specialization, available_from, available_to)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, departmentId, specialization, availableFrom || '09:00', availableTo || '17:00']
  );

  res.status(201).json({
    success: true,
    doctorId: result.id,
    message: 'Doctor created successfully'
  });
}));

// Get doctor's appointments
router.get('/:id/appointments', asyncHandler(async (req, res) => {
  const { date } = req.query;

  let sql = `
    SELECT a.*, p.name as patient_name, p.phone as patient_phone, p.email as patient_email
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE a.doctor_id = ?
  `;

  const params = [req.params.id];

  if (date) {
    sql += ' AND a.appointment_date = ?';
    params.push(date);
  }

  sql += ' ORDER BY a.appointment_date, a.appointment_time';

  const appointments = await query(sql, params);
  res.json(appointments);
}));

module.exports = router;
