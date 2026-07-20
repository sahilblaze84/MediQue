const express = require('express');
const router = express.Router();
const { query, get, run } = require('../utils/database');
const notificationService = require('../services/notificationService');
const { validateAppointmentCreation, validateAppointmentStatus } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Create new appointment
router.post('/', validateAppointmentCreation, asyncHandler(async (req, res) => {
  const {
    patientId,
    doctorId,
    departmentId,
    appointmentDate,
    appointmentTime,
    priorityLevel,
    symptomsSummary,
    aiSummary
  } = req.body;

  const result = await run(
    `INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, appointment_time, priority_level, symptoms_summary, ai_summary)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [patientId, doctorId, departmentId, appointmentDate, appointmentTime, priorityLevel, symptomsSummary, aiSummary]
  );

  // Send notification asynchronously
  notificationService.sendAppointmentConfirmation(result.id)
    .then(() => console.log('Notification sent'))
    .catch(err => console.error('Notification failed:', err));

  res.status(201).json({
    success: true,
    appointmentId: result.id,
    message: 'Appointment created successfully'
  });
}));

// Get all appointments
router.get('/', asyncHandler(async (req, res) => {
  const { status, departmentId, doctorId, patientId } = req.query;

  let sql = `
    SELECT a.*, p.name as patient_name, p.phone as patient_phone, p.email as patient_email,
           d.name as doctor_name, d.email as doctor_email, dept.name as department_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    JOIN departments dept ON a.department_id = dept.id
    WHERE 1=1
  `;

  const params = [];

  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }

  if (departmentId) {
    sql += ' AND a.department_id = ?';
    params.push(departmentId);
  }

  if (doctorId) {
    sql += ' AND a.doctor_id = ?';
    params.push(doctorId);
  }

  if (patientId) {
    sql += ' AND a.patient_id = ?';
    params.push(patientId);
  }

  sql += ' ORDER BY a.appointment_date, a.appointment_time';

  const appointments = await query(sql, params);
  res.json(appointments);
}));

// Get appointment by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const appointment = await get(
    `SELECT a.*, p.name as patient_name, p.email as patient_email, p.phone as patient_phone,
           d.name as doctor_name, d.email as doctor_email, dept.name as department_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    JOIN departments dept ON a.department_id = dept.id
    WHERE a.id = ?`,
    [req.params.id]
  );

  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  res.json(appointment);
}));

// Update appointment status
router.patch('/:id/status', validateAppointmentStatus, asyncHandler(async (req, res) => {
  const { status } = req.body;

  await run('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);

  res.json({ success: true, message: 'Appointment status updated' });
}));

// Get available appointment slots
router.get('/available/slots', asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ error: 'Doctor ID and date are required' });
  }

  // Generate available time slots (9 AM to 5 PM)
  const timeSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    timeSlots.push(`${hour}:00`);
    timeSlots.push(`${hour}:30`);
  }

  // Get booked slots
  const bookedRows = await query(
    'SELECT appointment_time FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status != ?',
    [doctorId, date, 'cancelled']
  );

  const bookedTimes = bookedRows.map(row => row.appointment_time);
  const availableSlots = timeSlots.filter(slot => !bookedTimes.includes(slot));
  
  res.json(availableSlots);
}));

module.exports = router;
