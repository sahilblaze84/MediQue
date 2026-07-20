import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Clock, Shield, Brain, Calendar, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-medical-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <HeartPulse className="h-20 w-20 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              MediQueue AI
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              AI-Powered Hospital Triage & Appointment Management System
            </p>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-blue-100">
              Supporting SDG 3 - Good Health & Well-being by reducing waiting times and improving patient flow
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/symptoms" className="btn-medical text-lg">
                Start Symptom Check
              </Link>
              <Link to="/booking" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 text-lg">
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center hover:shadow-xl transition-shadow">
              <Brain className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
              <p className="text-gray-600">
                Describe your symptoms and our AI analyzes them to recommend the right department and priority level
              </p>
            </div>
            <div className="card text-center hover:shadow-xl transition-shadow">
              <Calendar className="h-16 w-16 text-medical-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Smart Booking</h3>
              <p className="text-gray-600">
                Get automatically matched with available doctors and book the earliest appointment
              </p>
            </div>
            <div className="card text-center hover:shadow-xl transition-shadow">
              <Clock className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Reduced Wait Times</h3>
              <p className="text-gray-600">
                Priority-based triage ensures urgent cases get immediate attention
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Benefits
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <Shield className="h-12 w-12 text-medical-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Patient Safety</h3>
              <p className="text-gray-600 text-sm">
                Urgent cases are identified and prioritized quickly
              </p>
            </div>
            <div className="card">
              <Clock className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Time Efficient</h3>
              <p className="text-gray-600 text-sm">
                Reduced waiting times for all patients
              </p>
            </div>
            <div className="card">
              <Users className="h-12 w-12 text-medical-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Better Resource Use</h3>
              <p className="text-gray-600 text-sm">
                Hospitals manage appointments and staff more efficiently
              </p>
            </div>
            <div className="card">
              <HeartPulse className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Improved Care</h3>
              <p className="text-gray-600 text-sm">
                Doctors receive AI-generated summaries before appointments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary-600 to-medical-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Experience Better Healthcare?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Start your symptom check now and get matched with the right doctor
          </p>
          <Link to="/symptoms" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 text-lg inline-block">
            Get Started
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 MediQueue AI. Supporting UN SDG 3 - Good Health & Well-being
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
