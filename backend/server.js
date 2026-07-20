const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const { requestLogger } = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
const symptomRoutes = require('./routes/symptoms');
const appointmentRoutes = require('./routes/appointments');
const departmentRoutes = require('./routes/departments');
const doctorRoutes = require('./routes/doctors');
const patientRoutes = require('./routes/patients');

app.use('/api/symptoms', symptomRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MediQueue AI Backend is running' });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const { startKeepAlive } = require('./services/keepAlive');

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MediQueue AI Backend server running on port ${PORT}`);
    startKeepAlive(PORT);
  });
}

module.exports = app;


