import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, CalendarCheck, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [formData, setFormData] = useState({
    departmentId: '',
    doctorId: '',
    date: '',
    time: '',
    patientId: null
  });

  useEffect(() => {
    // Load stored analysis
    const storedAnalysis = localStorage.getItem('symptomAnalysis');
    if (storedAnalysis) {
      setAnalysis(JSON.parse(storedAnalysis));
    }
    
    // Load departments
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (formData.departmentId) {
      fetchDoctors(formData.departmentId);
    }
  }, [formData.departmentId]);

  useEffect(() => {
    if (formData.doctorId && formData.date) {
      fetchAvailableSlots(formData.doctorId, formData.date);
    }
  }, [formData.doctorId, formData.date]);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data);
      
      // Auto-select department from analysis
      if (analysis && analysis.department) {
        const matchedDept = response.data.find(d => 
          d.name.toLowerCase() === analysis.department.toLowerCase()
        );
        if (matchedDept) {
          setFormData(prev => ({ ...prev, departmentId: matchedDept.id }));
        }
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to load departments. Please try again.');
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchDoctors = async (departmentId) => {
    setLoadingDoctors(true);
    try {
      const response = await axios.get(`/api/departments/${departmentId}/doctors`);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    setLoadingSlots(true);
    try {
      const response = await axios.get('/api/appointments/available/slots', {
        params: { doctorId, date }
      });
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError('Failed to load available slots. Please try again.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    setLoading(true);
    setError('');
    
    try {
      // First, create or get patient
      let patientId = formData.patientId;
      
      if (!patientId && analysis?.patientInfo?.name && analysis?.patientInfo?.phone) {
        try {
          // Try to create patient first
          const patientResponse = await axios.post('/api/patients', {
            name: analysis.patientInfo.name,
            email: analysis.patientInfo.email,
            phone: analysis.patientInfo.phone
          });
          patientId = patientResponse.data.patientId;
        } catch (patientError) {
          console.error('Error creating patient:', patientError);
          // Fallback to existing patient or use default
          patientId = 1;
        }
      }

      const appointmentData = {
        patientId: patientId || 1,
        doctorId: formData.doctorId,
        departmentId: formData.departmentId,
        appointmentDate: formData.date,
        appointmentTime: formData.time,
        priorityLevel: analysis?.priority || 'Medium',
        symptomsSummary: analysis?.symptoms?.join(', ') || '',
        aiSummary: analysis?.summary || ''
      };

      const response = await axios.post('/api/appointments', appointmentData);
      
      if (response.data.success) {
        // Clear stored analysis
        localStorage.removeItem('symptomAnalysis');
        
        navigate('/booking-confirmation', { 
          state: { 
            appointmentId: response.data.appointmentId,
            appointmentData 
          } 
        });
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <CalendarCheck className="h-16 w-16 text-medical-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Book Your Appointment
          </h1>
          <p className="text-lg text-gray-600">
            Select your preferred date and time
          </p>
        </div>

        {analysis && (
          <div className="card mb-8 bg-blue-50">
            <h3 className="font-semibold text-gray-800 mb-2">AI Analysis Summary</h3>
            <p className="text-sm text-gray-600">
              <strong>Department:</strong> {analysis.department} | 
              <strong> Priority:</strong> {analysis.priority}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="card">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-24 h-1 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`}></div>}
              </div>
            ))}
          </div>

          {/* Step 1: Department */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600" />
                Select Department
              </h2>
              {loadingDepartments ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {departments.map(dept => (
                    <button
                      key={dept.id}
                      onClick={() => setFormData(prev => ({ ...prev, departmentId: dept.id }))}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        formData.departmentId === dept.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-800">{dept.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{dept.description}</p>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setStep(2)}
                disabled={!formData.departmentId}
                className="mt-6 btn-medical w-full disabled:opacity-50"
              >
                Next: Select Doctor
              </button>
            </div>
          )}

          {/* Step 2: Doctor */}
          {step === 2 && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="text-primary-600 hover:text-primary-700 mb-4"
              >
                ← Back to Departments
              </button>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600" />
                Select Doctor
              </h2>
              {loadingDoctors ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No doctors available in this department
                </div>
              ) : (
                <div className="space-y-4">
                  {doctors.map(doctor => (
                    <button
                      key={doctor.id}
                      onClick={() => setFormData(prev => ({ ...prev, doctorId: doctor.id }))}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        formData.doctorId === doctor.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">Dr. {doctor.name}</h3>
                          <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{doctor.available_from} - {doctor.available_to}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setStep(3)}
                disabled={!formData.doctorId}
                className="mt-6 btn-medical w-full disabled:opacity-50"
              >
                Next: Select Date & Time
              </button>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <div>
              <button
                onClick={() => setStep(2)}
                className="text-primary-600 hover:text-primary-700 mb-4"
              >
                ← Back to Doctors
              </button>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                Select Date & Time
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="input-label">Date</label>
                  <input
                    type="date"
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="input-field"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="input-label">Time</label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                    </div>
                  ) : (
                    <select
                      className="input-field"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      disabled={!formData.date}
                    >
                      <option value="">Select time slot</option>
                      {availableSlots.length === 0 && formData.date ? (
                        <option disabled>No available slots for this date</option>
                      ) : (
                        availableSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))
                      )}
                    </select>
                  )}
                </div>
              </div>

              <button
                onClick={handleBookAppointment}
                disabled={!formData.date || !formData.time || loading || availableSlots.length === 0}
                className="mt-6 btn-medical w-full disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CalendarCheck className="h-5 w-5" />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
