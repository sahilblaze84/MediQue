import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <HeartPulse className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-800">MediQueue AI</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Home
            </Link>
            <Link to="/symptoms" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Symptom Check
            </Link>
            <Link to="/booking" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Book Appointment
            </Link>
            <Link to="/doctor-dashboard" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Doctor Portal
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/symptoms"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md font-medium"
              onClick={() => setIsOpen(false)}
            >
              Symptom Check
            </Link>
            <Link
              to="/booking"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md font-medium"
              onClick={() => setIsOpen(false)}
            >
              Book Appointment
            </Link>
            <Link
              to="/doctor-dashboard"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md font-medium"
              onClick={() => setIsOpen(false)}
            >
              Doctor Portal
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
