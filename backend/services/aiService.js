const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze symptoms and provide department recommendation, priority level, and summary
 * @param {Array} symptoms - List of symptoms
 * @param {string} severity - Severity level (mild, moderate, severe)
 * @param {string} duration - Duration of symptoms
 * @returns {Object} Analysis result with department, priority, and summary
 */
async function analyzeSymptoms(symptoms, severity, duration) {
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

Respond in JSON format with this structure:
{
  "department": "department name",
  "priority": "priority level",
  "summary": "brief summary for doctor",
  "recommendedAction": "brief recommended action"
}

Consider these guidelines:
- Emergency priority: Chest pain, severe breathing difficulties, severe bleeding, loss of consciousness, sudden severe pain, high fever (>103°F/39.4°C) with stiff neck, severe allergic reactions
- High priority: High fever (102-103°F/38.9-39.4°C), severe pain, symptoms lasting more than a week, worsening condition, difficulty breathing, persistent vomiting
- Medium priority: Moderate symptoms, symptoms lasting 3-7 days, manageable discomfort, mild to moderate fever (<102°F/38.9°C)
- Low priority: Mild symptoms, symptoms lasting less than 3 days, minor discomfort, routine checkups

Department mapping guidelines:
- Emergency: Life-threatening conditions, severe trauma, chest pain, severe breathing issues
- Cardiology: Heart-related symptoms, chest pain, palpitations, high blood pressure concerns
- Neurology: Headaches, dizziness, numbness, seizures, memory issues, stroke symptoms
- Orthopedics: Bone, joint, muscle pain, fractures, back pain, arthritis
- Dermatology: Skin rashes, acne, eczema, unusual moles, hair loss
- ENT: Ear pain, sore throat, sinus issues, hearing problems, tonsillitis
- Ophthalmology: Eye pain, vision problems, eye infections, glaucoma concerns
- Pediatrics: Child-specific conditions (patients under 18)
- Gynecology: Women's health issues, reproductive concerns
- General Medicine: General health concerns, flu-like symptoms, routine checkups
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a hospital triage AI assistant. You help route patients to the right department and prioritize cases. You do not diagnose or prescribe treatments. Your responses must be valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content;
    
    // Clean response text to extract JSON
    const jsonMatch = responseText.match(/\{[^}]+\}/s);
    const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
    
    // Parse JSON response
    const analysis = JSON.parse(cleanJson);
    
    // Validate the response
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
    console.error('Error calling OpenAI API:', error);
    
    // Fallback to basic rule-based analysis if AI fails
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
