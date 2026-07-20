import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const SymptomForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    symptoms: [],
    customSymptom: '',
    severity: 'moderate',
    duration: '',
    patientInfo: {
      name: '',
      email: '',
      phone: ''
    }
  });

  const commonSymptoms = [
    'Fever', 'Headache', 'Chest pain', 'Cough', 'Breathing difficulty',
    'Nausea', 'Vomiting', 'Abdominal pain', 'Diarrhea', 'Fatigue',
    'Dizziness', 'Joint pain', 'Back pain', 'Skin rash', 'Itching',
    'Sore throat', 'Ear pain', 'Vision problems', 'Numbness', 'Palpitations'
  ];

  const severityLevels = [
    { value: 'mild', label: 'Mild', color: 'bg-green-100 text-green-800' },
    { value: 'moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'severe', label: 'Severe', color: 'bg-red-100 text-red-800' }
  ];

  const handleSymptomToggle = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleCustomSymptomAdd = () => {
    if (formData.customSymptom.trim() && !formData.symptoms.includes(formData.customSymptom.trim())) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, formData.customSymptom.trim()],
        customSymptom: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.symptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await axios.post('/api/symptoms/analyze', {
        symptoms: formData.symptoms,
        severity: formData.severity,
        duration: formData.duration,
        patientInfo: formData.patientInfo
      });

      setAnalysis(response.data.analysis);
    } catch (err) {
      setError('Failed to analyze symptoms. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    // Store analysis data for booking
    localStorage.setItem('symptomAnalysis', JSON.stringify({
      ...analysis,
      symptoms: formData.symptoms,
      severity: formData.severity,
      duration: formData.duration,
      patientInfo: formData.patientInfo
    }));
    navigate('/booking');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Emergency': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Brain className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI Symptom Analysis
          </h1>
          <p className="text-lg text-gray-600">
            Describe your symptoms and let our AI recommend the right department
          </p>
        </div>

        {!analysis ? (
          <div className="card">
            <form onSubmit={handleSubmit}>
              {/* Patient Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Patient Information</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="input-label">Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="John Doe"
                      value={formData.patientInfo.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        patientInfo: { ...prev.patientInfo, name: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="input-label">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="john@example.com"
                      value={formData.patientInfo.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        patientInfo: { ...prev.patientInfo, email: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="input-label">Phone Number</label>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="+1234567890"
                      value={formData.patientInfo.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        patientInfo: { ...prev.patientInfo, phone: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Symptoms Selection */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Your Symptoms</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {commonSymptoms.map(symptom => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => handleSymptomToggle(symptom)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                        formData.symptoms.includes(symptom)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300 text-gray-700'
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>

                {/* Custom Symptom */}
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="Add custom symptom..."
                    value={formData.customSymptom}
                    onChange={(e) => setFormData(prev => ({ ...prev, customSymptom: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCustomSymptomAdd())}
                  />
                  <button
                    type="button"
                    onClick={handleCustomSymptomAdd}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Symptoms */}
                {formData.symptoms.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Selected symptoms:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.symptoms.map(symptom => (
                        <span
                          key={symptom}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                        >
                          {symptom}
                          <button
                            type="button"
                            onClick={() => handleSymptomToggle(symptom)}
                            className="hover:text-primary-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Severity */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Severity Level</h2>
                <div className="flex gap-4">
                  {severityLevels.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
                        formData.severity === level.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${level.color}`}>
                        {level.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="mb-8">
                <label className="input-label">How long have you had these symptoms?</label>
                <select
                  className="input-field"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                >
                  <option value="">Select duration</option>
                  <option value="less than 24 hours">Less than 24 hours</option>
                  <option value="1-2 days">1-2 days</option>
                  <option value="3-7 days">3-7 days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="more than 2 weeks">More than 2 weeks</option>
                </select>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-medical flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" />
                    Analyze Symptoms
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="card">
            <div className="text-center mb-8">
              <CheckCircle className="h-16 w-16 text-medical-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Analysis Complete</h2>
              <p className="text-gray-600">Based on your symptoms, here's our AI recommendation</p>
            </div>

            <div className="space-y-6">
              {/* Department */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Recommended Department</h3>
                <p className="text-2xl font-bold text-primary-600">{analysis.department}</p>
              </div>

              {/* Priority */}
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Priority Level</h3>
                <div className="flex items-center gap-3">
                  <span className={`w-4 h-4 rounded-full ${getPriorityColor(analysis.priority)}`}></span>
                  <span className="text-2xl font-bold text-gray-800">{analysis.priority}</span>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary for Doctor</h3>
                <p className="text-gray-700">{analysis.summary}</p>
              </div>

              {/* Recommended Action */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Recommended Action</h3>
                <p className="text-gray-700">{analysis.recommendedAction}</p>
              </div>

              {/* Emergency Warning */}
              {analysis.priority === 'Emergency' && (
                <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-800">Emergency Attention Required</h3>
                  </div>
                  <p className="text-red-700">
                    Based on your symptoms, you may need immediate medical attention. Please visit the emergency department or call emergency services.
                  </p>
                </div>
              )}

              <button
                onClick={handleBookAppointment}
                className="w-full btn-medical flex items-center justify-center gap-2"
              >
                <Clock className="h-5 w-5" />
                Book Appointment
              </button>

              <button
                onClick={() => setAnalysis(null)}
                className="w-full btn-secondary"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomForm;
