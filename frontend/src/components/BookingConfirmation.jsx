import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, User, Phone, Mail, ArrowLeft } from 'lucide-react';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentId, appointmentData } = location.state || {};

  if (!appointmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No appointment information found</p>
          <button
            onClick={() => navigate('/booking')}
            className="btn-medical"
          >
            Book an Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Appointment Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your appointment has been successfully booked
          </p>
        </div>

        <div className="card mb-6">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Appointment Details</h2>
            <p className="text-sm text-gray-500">Confirmation ID: #{appointmentId}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold text-gray-800">{appointmentData?.appointmentDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-semibold text-gray-800">{appointmentData?.appointmentTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-primary-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Priority Level</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  appointmentData?.priorityLevel === 'Emergency' ? 'bg-red-100 text-red-800' :
                  appointmentData?.priorityLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                  appointmentData?.priorityLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {appointmentData?.priorityLevel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">What's Next?</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">1</span>
              </div>
              <p className="text-gray-600">You'll receive a confirmation email and SMS shortly</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">2</span>
              </div>
              <p className="text-gray-600">You'll get a reminder 24 hours before your appointment</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">3</span>
              </div>
              <p className="text-gray-600">Please arrive 15 minutes before your appointment time</p>
            </li>
          </ul>
        </div>

        {appointmentData?.aiSummary && (
          <div className="card mb-6 bg-blue-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Generated Summary</h3>
            <p className="text-gray-700">{appointmentData.aiSummary}</p>
          </div>
        )}

        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">Important Reminder</h4>
              <p className="text-sm text-yellow-700">
                If you need to reschedule or cancel, please contact us at least 24 hours before your appointment time.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>
          <button
            onClick={() => navigate('/symptoms')}
            className="flex-1 btn-medical"
          >
            New Symptom Check
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
