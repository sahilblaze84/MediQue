/**
 * Validation middleware for API requests
 */

/**
 * Validate symptom analysis request
 */
const validateSymptomAnalysis = (req, res, next) => {
  const { symptoms, severity, duration } = req.body;
  
  if (!symptoms || (Array.isArray(symptoms) && symptoms.length === 0)) {
    return res.status(400).json({ error: 'Symptoms are required' });
  }
  
  if (severity && !['mild', 'moderate', 'severe'].includes(severity.toLowerCase())) {
    return res.status(400).json({ error: 'Severity must be mild, moderate, or severe' });
  }
  
  next();
};

/**
 * Validate appointment creation request
 */
const validateAppointmentCreation = (req, res, next) => {
  const { patientId, doctorId, departmentId, appointmentDate, appointmentTime, priorityLevel } = req.body;
  
  if (!patientId || !doctorId || !departmentId) {
    return res.status(400).json({ error: 'Patient ID, Doctor ID, and Department ID are required' });
  }
  
  if (!appointmentDate || !appointmentTime) {
    return res.status(400).json({ error: 'Appointment date and time are required' });
  }
  
  if (!priorityLevel || !['Emergency', 'High', 'Medium', 'Low'].includes(priorityLevel)) {
    return res.status(400).json({ error: 'Priority level must be Emergency, High, Medium, or Low' });
  }
  
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(appointmentDate)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }
  
  // Validate time format
  const timeRegex = /^\d{1,2}:\d{2}$/;
  if (!timeRegex.test(appointmentTime)) {
    return res.status(400).json({ error: 'Invalid time format. Use HH:MM' });
  }
  
  next();
};

/**
 * Validate appointment status update
 */
const validateAppointmentStatus = (req, res, next) => {
  const { status } = req.body;
  
  if (!status || !['scheduled', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Status must be scheduled, confirmed, completed, or cancelled' });
  }
  
  next();
};

/**
 * Validate doctor creation
 */
const validateDoctorCreation = (req, res, next) => {
  const { name, email, departmentId } = req.body;
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Doctor name is required' });
  }
  
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  if (!departmentId) {
    return res.status(400).json({ error: 'Department ID is required' });
  }
  
  next();
};

/**
 * Validate patient creation
 */
const validatePatientCreation = (req, res, next) => {
  const { name, phone, email } = req.body;
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Patient name is required' });
  }
  
  if (!phone || phone.trim().length === 0) {
    return res.status(400).json({ error: 'Patient phone is required' });
  }
  
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  next();
};

module.exports = {
  validateSymptomAnalysis,
  validateAppointmentCreation,
  validateAppointmentStatus,
  validateDoctorCreation,
  validatePatientCreation
};
