const nodemailer = require('nodemailer');
const twilio = require('twilio');
const db = require('../database/db');

// Email transporter configuration
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

// Twilio client (only initialize if credentials are valid)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

/**
 * Send appointment confirmation via email and SMS
 */
async function sendAppointmentConfirmation(appointmentId) {
  try {
    // Get appointment details
    const appointment = await getAppointmentDetails(appointmentId);
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Send email
    await sendEmail(
      appointment.patient_email,
      'Appointment Confirmation - MediQueue AI',
      generateAppointmentEmail(appointment)
    );

    // Send SMS
    await sendSMS(
      appointment.patient_phone,
      generateAppointmentSMS(appointment)
    );

    console.log('Appointment confirmation sent successfully');
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    throw error;
  }
}

/**
 * Send appointment reminder
 */
async function sendAppointmentReminder(appointmentId) {
  try {
    const appointment = await getAppointmentDetails(appointmentId);
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    await sendEmail(
      appointment.patient_email,
      'Appointment Reminder - MediQueue AI',
      generateReminderEmail(appointment)
    );

    await sendSMS(
      appointment.patient_phone,
      generateReminderSMS(appointment)
    );

    console.log('Appointment reminder sent successfully');
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    throw error;
  }
}

/**
 * Send AI summary to doctor
 */
async function sendAISummaryToDoctor(appointmentId) {
  try {
    const appointment = await getAppointmentDetails(appointmentId);
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    await sendEmail(
      appointment.doctor_email,
      `Patient Summary - ${appointment.patient_name}`,
      generateDoctorSummaryEmail(appointment)
    );

    console.log('AI summary sent to doctor successfully');
  } catch (error) {
    console.error('Error sending AI summary to doctor:', error);
    throw error;
  }
}

/**
 * Get appointment details from database
 */
function getAppointmentDetails(appointmentId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT a.*, p.name as patient_name, p.email as patient_email, p.phone as patient_phone,
             d.name as doctor_name, d.email as doctor_email, dept.name as department_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN departments dept ON a.department_id = dept.id
      WHERE a.id = ?
      `,
      [appointmentId],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
}

/**
 * Send email
 */
async function sendEmail(to, subject, text) {
  if (!transporter) {
    console.log('Email not configured, skipping email send');
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html: text
  });
}

/**
 * Send SMS
 */
async function sendSMS(to, message) {
  if (!twilioClient) {
    console.log('Twilio not configured, skipping SMS send');
    return;
  }

  await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });
}

/**
 * Generate appointment confirmation email
 */
function generateAppointmentEmail(appointment) {
  return `
    <h2>Appointment Confirmation</h2>
    <p>Dear ${appointment.patient_name},</p>
    <p>Your appointment has been successfully booked.</p>
    <h3>Appointment Details:</h3>
    <ul>
      <li><strong>Department:</strong> ${appointment.department_name}</li>
      <li><strong>Doctor:</strong> Dr. ${appointment.doctor_name}</li>
      <li><strong>Date:</strong> ${appointment.appointment_date}</li>
      <li><strong>Time:</strong> ${appointment.appointment_time}</li>
      <li><strong>Priority:</strong> ${appointment.priority_level}</li>
    </ul>
    <h3>AI Summary:</h3>
    <p>${appointment.ai_summary}</p>
    <p>Please arrive 15 minutes before your appointment time.</p>
    <p>If you need to reschedule, please contact us.</p>
    <p>Thank you,<br>MediQueue AI Team</p>
  `;
}

/**
 * Generate appointment confirmation SMS
 */
function generateAppointmentSMS(appointment) {
  return `MediQueue AI: Your appointment is confirmed for ${appointment.appointment_date} at ${appointment.appointment_time} with Dr. ${appointment.doctor_name} (${appointment.department_name}). Priority: ${appointment.priority_level}. Please arrive 15 minutes early.`;
}

/**
 * Generate reminder email
 */
function generateReminderEmail(appointment) {
  return `
    <h2>Appointment Reminder</h2>
    <p>Dear ${appointment.patient_name},</p>
    <p>This is a reminder about your upcoming appointment.</p>
    <h3>Appointment Details:</h3>
    <ul>
      <li><strong>Department:</strong> ${appointment.department_name}</li>
      <li><strong>Doctor:</strong> Dr. ${appointment.doctor_name}</li>
      <li><strong>Date:</strong> ${appointment.appointment_date}</li>
      <li><strong>Time:</strong> ${appointment.appointment_time}</li>
    </ul>
    <p>Please arrive 15 minutes before your appointment time.</p>
    <p>Thank you,<br>MediQueue AI Team</p>
  `;
}

/**
 * Generate reminder SMS
 */
function generateReminderSMS(appointment) {
  return `MediQueue AI: Reminder - You have an appointment tomorrow at ${appointment.appointment_time} with Dr. ${appointment.doctor_name}. Please arrive 15 minutes early.`;
}

/**
 * Generate doctor summary email
 */
function generateDoctorSummaryEmail(appointment) {
  return `
    <h2>Patient Summary</h2>
    <p>Dr. ${appointment.doctor_name},</p>
    <p>You have an upcoming appointment with the following patient:</p>
    <h3>Patient Information:</h3>
    <ul>
      <li><strong>Name:</strong> ${appointment.patient_name}</li>
      <li><strong>Phone:</strong> ${appointment.patient_phone}</li>
      <li><strong>Email:</strong> ${appointment.patient_email}</li>
    </ul>
    <h3>Appointment Details:</h3>
    <ul>
      <li><strong>Date:</strong> ${appointment.appointment_date}</li>
      <li><strong>Time:</strong> ${appointment.appointment_time}</li>
      <li><strong>Priority:</strong> ${appointment.priority_level}</li>
    </ul>
    <h3>AI-Generated Summary:</h3>
    <p>${appointment.ai_summary}</p>
    <h3>Symptoms Summary:</h3>
    <p>${appointment.symptoms_summary}</p>
    <p>Best regards,<br>MediQueue AI System</p>
  `;
}

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAISummaryToDoctor
};
