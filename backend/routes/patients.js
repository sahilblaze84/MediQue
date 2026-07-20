const express = require('express');
const router = express.Router();
const { get, query, run } = require('../utils/database');
const { validatePatientCreation } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all patients
router.get('/', asyncHandler(async (req, res) => {
  const patients = await query('SELECT * FROM patients ORDER BY name');
  res.json(patients);
}));

// Get patient by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const patient = await get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
  
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  
  res.json(patient);
}));

// Create new patient
router.post('/', validatePatientCreation, asyncHandler(async (req, res) => {
  const { name, email, phone, dateOfBirth } = req.body;
  
  const result = await run(
    'INSERT INTO patients (name, email, phone, date_of_birth) VALUES (?, ?, ?, ?)',
    [name, email, phone, dateOfBirth]
  );
  
  res.status(201).json({
    success: true,
    patientId: result.id,
    message: 'Patient created successfully'
  });
}));

// Get patient's appointments
router.get('/:id/appointments', asyncHandler(async (req, res) => {
  const appointments = await query(
    `SELECT a.*, d.name as doctor_name, dept.name as department_name
     FROM appointments a
     JOIN doctors d ON a.doctor_id = d.id
     JOIN departments dept ON a.department_id = dept.id
     WHERE a.patient_id = ?
     ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
    [req.params.id]
  );
  
  res.json(appointments);
}));

// Get patient's symptom history
router.get('/:id/symptoms', asyncHandler(async (req, res) => {
  const symptoms = await query(
    'SELECT * FROM symptom_submissions WHERE patient_id = ? ORDER BY created_at DESC',
    [req.params.id]
  );
  
  // Parse JSON symptoms
  const parsedSymptoms = symptoms.map(s => ({
    ...s,
    symptoms: JSON.parse(s.symptoms)
  }));
  
  res.json(parsedSymptoms);
}));

// Update patient information
router.patch('/:id', asyncHandler(async (req, res) => {
  const { name, email, phone, dateOfBirth } = req.body;
  
  const patient = await get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
  
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  
  await run(
    'UPDATE patients SET name = ?, email = ?, phone = ?, date_of_birth = ? WHERE id = ?',
    [name || patient.name, email || patient.email, phone || patient.phone, dateOfBirth || patient.date_of_birth, req.params.id]
  );
  
  res.json({ success: true, message: 'Patient updated successfully' });
}));

module.exports = router;
