import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SymptomForm from './components/SymptomForm';
import AppointmentBooking from './components/AppointmentBooking';
import DoctorDashboard from './components/DoctorDashboard';
import BookingConfirmation from './components/BookingConfirmation';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/symptoms" element={<SymptomForm />} />
          <Route path="/booking" element={<AppointmentBooking />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
