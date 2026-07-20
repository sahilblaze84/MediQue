const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { run, query } = require('../utils/database');
const { validateSymptomAnalysis } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Submit symptoms for AI analysis
router.post('/analyze', validateSymptomAnalysis, asyncHandler(async (req, res) => {
  const { symptoms, severity, duration, patientInfo } = req.body;

  // Get AI analysis
  const analysis = await aiService.analyzeSymptoms(symptoms, severity, duration);

  // Store symptom submission
  const result = await run(
    `INSERT INTO symptom_submissions (patient_id, symptoms, severity, duration, suggested_department, priority_level, ai_summary)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      patientInfo?.id || null,
      JSON.stringify(symptoms),
      severity || 'moderate',
      duration || 'unknown',
      analysis.department,
      analysis.priority,
      analysis.summary
    ]
  );

  res.json({
    success: true,
    analysis: {
      department: analysis.department,
      priority: analysis.priority,
      summary: analysis.summary,
      recommendedAction: analysis.recommendedAction
    },
    submissionId: result.id
  });
}));

// Get symptom submission history
router.get('/history/:patientId', asyncHandler(async (req, res) => {
  const symptoms = await query(
    'SELECT * FROM symptom_submissions WHERE patient_id = ? ORDER BY created_at DESC',
    [req.params.patientId]
  );

  // Parse JSON symptoms
  const parsedSymptoms = symptoms.map(s => ({
    ...s,
    symptoms: JSON.parse(s.symptoms)
  }));

  res.json(parsedSymptoms);
}));

module.exports = router;
