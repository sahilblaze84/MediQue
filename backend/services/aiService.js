const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Analyze symptoms and provide department recommendation, priority level, and summary
 * @param {Array} symptoms - List of symptoms
 * @param {string} severity - Severity level (mild, moderate, severe)
 * @param {string} duration - Duration of symptoms
 * @returns {Object} Analysis result with department, priority, and summary
 */
async function analyzeSymptoms(symptoms, severity, duration) {
  if (!genAI) {
    console.log('[AI Service] No GEMINI_API_KEY found — using rule-based fallback.');
    return fallbackAnalysis(symptoms, severity, duration);
  }

  try {
    const symptomsText = Array.isArray(symptoms) ? symptoms.join(', ') : symptoms;

    const prompt = `
You are a hospital triage AI assistant. Your role is to analyze patient symptoms and recommend the appropriate medical department, priority level, and provide a brief summary for the doctor.

IMPORTANT: You are NOT diagnosing diseases or prescribing treatments. You are only helping route patients to the right department and prioritize urgent cases.

Patient Information:
- Symptoms: ${symptomsText}
- Severity: ${severity || 'moderate'}
- Duration: ${duration || 'unknown'}

Please analyze this information and provide:
1. Department recommendation (choose from: General Medicine, Orthopedics, Dermatology, Cardiology, Neurology, Pediatrics, Emergency, Gynecology, Ophthalmology, ENT)
2. Priority level (choose from: Emergency, High, Medium, Low)
3. A brief summary (2-3 sentences) for the doctor explaining the patient's condition
4. Recommended action (brief advice for the patient)

Respond in JSON format ONLY (no explanation, no markdown, just raw JSON):
{
  "department": "department name",
  "priority": "priority level",
  "summary": "brief summary for doctor",
  "recommendedAction": "brief recommended action"
}

Guidelines:
- Emergency: Chest pain, severe breathing difficulties, severe bleeding, loss of consciousness
- High: High fever, severe pain, worsening condition
- Medium: Moderate symptoms lasting 3-7 days
- Low: Mild symptoms, routine concerns
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
    const analysis = JSON.parse(cleanJson);

    if (!analysis.department || !analysis.priority || !analysis.summary) {
      throw new Error('Invalid AI response format');
    }

    return {
      department: analysis.department,
      priority: analysis.priority,
      summary: analysis.summary,
      recommendedAction: analysis.recommendedAction || 'Please proceed to the recommended department for evaluation.'
    };

  } catch (error) {
    console.error('[AI Service] Gemini API error — using rule-based fallback:', error.message);
    return fallbackAnalysis(symptoms, severity, duration);
  }
}

/**
 * Enhanced fallback rule-based symptom analysis
 */
function fallbackAnalysis(symptoms, severity, duration) {
  const symptomsText = Array.isArray(symptoms) ? symptoms.join(', ').toLowerCase() : symptoms.toLowerCase();
  const severityLower = (severity || 'moderate').toLowerCase();
  
  let department = 'General Medicine';
  let priority = 'Medium';
  let recommendedAction = 'Please proceed to the recommended department for evaluation.';
  
  // Emergency indicators - highest priority
  if (symptomsText.includes('chest pain') || 
      symptomsText.includes('breathing difficulty') || 
      symptomsText.includes('shortness of breath') ||
      symptomsText.includes('unconscious') ||
      symptomsText.includes('fainting') ||
      symptomsText.includes('severe bleeding') ||
      symptomsText.includes('severe burn') ||
      symptomsText.includes('stroke') ||
      symptomsText.includes('heart attack') ||
      severityLower === 'severe') {
    department = 'Emergency';
    priority = 'Emergency';
    recommendedAction = 'Please seek immediate emergency care or call emergency services.';
  }
  // Cardiology indicators
  else if (symptomsText.includes('heart') || 
           symptomsText.includes('palpitation') ||
           symptomsText.includes('irregular heartbeat') ||
           symptomsText.includes('high blood pressure') ||
           (symptomsText.includes('chest') && !symptomsText.includes('pain'))) {
    department = 'Cardiology';
    priority = severityLower === 'severe' ? 'Emergency' : 'High';
    recommendedAction = 'Cardiac evaluation recommended. Monitor symptoms closely.';
  }
  // Neurology indicators
  else if (symptomsText.includes('headache') || 
           symptomsText.includes('migraine') ||
           symptomsText.includes('dizziness') ||
           symptomsText.includes('vertigo') ||
           symptomsText.includes('numbness') ||
           symptomsText.includes('tingling') ||
           symptomsText.includes('seizure') ||
           symptomsText.includes('memory loss') ||
           symptomsText.includes('confusion')) {
    department = 'Neurology';
    priority = severityLower === 'severe' ? 'High' : (severityLower === 'mild' ? 'Medium' : 'High');
    recommendedAction = 'Neurological evaluation recommended. Note any patterns or triggers.';
  }
  // Orthopedics indicators
  else if (symptomsText.includes('bone') || 
           symptomsText.includes('joint') ||
           symptomsText.includes('fracture') ||
           symptomsText.includes('broken') ||
           symptomsText.includes('back pain') ||
           symptomsText.includes('neck pain') ||
           symptomsText.includes('muscle') ||
           symptomsText.includes('arthritis') ||
           symptomsText.includes('sprain') ||
           symptomsText.includes('strain')) {
    department = 'Orthopedics';
    priority = severityLower === 'severe' ? 'High' : 'Medium';
    recommendedAction = 'Orthopedic evaluation recommended. Rest and avoid aggravating activities.';
  }
  // Dermatology indicators
  else if (symptomsText.includes('skin') || 
           symptomsText.includes('rash') ||
           symptomsText.includes('itch') ||
           symptomsText.includes('acne') ||
           symptomsText.includes('eczema') ||
           symptomsText.includes('psoriasis') ||
           symptomsText.includes('mole') ||
           symptomsText.includes('dry skin') ||
           symptomsText.includes('hives')) {
    department = 'Dermatology';
    priority = severityLower === 'severe' ? 'Medium' : 'Low';
    recommendedAction = 'Dermatological evaluation recommended. Avoid scratching affected areas.';
  }
  // ENT indicators
  else if (symptomsText.includes('ear') || 
           symptomsText.includes('earache') ||
           symptomsText.includes('throat') ||
           symptomsText.includes('sore throat') ||
           symptomsText.includes('nose') ||
           symptomsText.includes('sinus') ||
           symptomsText.includes('congestion') ||
           symptomsText.includes('tonsillitis') ||
           symptomsText.includes('hearing loss')) {
    department = 'ENT';
    priority = severityLower === 'severe' ? 'Medium' : 'Low';
    recommendedAction = 'ENT evaluation recommended. Stay hydrated and rest.';
  }
  // Ophthalmology indicators
  else if (symptomsText.includes('eye') || 
           symptomsText.includes('vision') ||
           symptomsText.includes('sight') ||
           symptomsText.includes('eye pain') ||
           symptomsText.includes('blurred vision') ||
           symptomsText.includes('red eye') ||
           symptomsText.includes('dry eye')) {
    department = 'Ophthalmology';
    priority = severityLower === 'severe' ? 'High' : 'Medium';
    recommendedAction = 'Ophthalmological evaluation recommended. Avoid eye strain.';
  }
  // Gynecology indicators
  else if (symptomsText.includes('pelvic') || 
           symptomsText.includes('menstrual') ||
           symptomsText.includes('period') ||
           symptomsText.includes('pregnancy') ||
           symptomsText.includes('menopause') ||
           symptomsText.includes('ovarian') ||
           symptomsText.includes('uterine')) {
    department = 'Gynecology';
    priority = severityLower === 'severe' ? 'High' : 'Medium';
    recommendedAction = 'Gynecological evaluation recommended.';
  }
  // General indicators with fever
  else if (symptomsText.includes('fever') || 
           symptomsText.includes('temperature') ||
           symptomsText.includes('chills') ||
           symptomsText.includes('flu') ||
           symptomsText.includes('cold') ||
           symptomsText.includes('cough') ||
           symptomsText.includes('nausea') ||
           symptomsText.includes('vomiting') ||
           symptomsText.includes('fatigue')) {
    department = 'General Medicine';
    priority = severityLower === 'severe' ? 'High' : (severityLower === 'mild' ? 'Low' : 'Medium');
    recommendedAction = 'General medical evaluation recommended. Rest and stay hydrated.';
  }
  
  // Adjust priority based on duration
  const durationLower = (duration || '').toLowerCase();
  if (durationLower.includes('week') || durationLower.includes('month')) {
    if (priority === 'Low') priority = 'Medium';
    if (priority === 'Medium' && severityLower !== 'mild') priority = 'High';
  }
  
  return {
    department,
    priority,
    summary: `Patient presents with ${symptomsText}. Severity: ${severity || 'moderate'}, Duration: ${duration || 'unknown'}. Triage assessment recommends ${department} department with ${priority} priority.`,
    recommendedAction
  };
}

module.exports = {
  analyzeSymptoms
};
