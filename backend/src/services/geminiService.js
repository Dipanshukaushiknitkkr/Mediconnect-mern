const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const analyzeSymptoms = async (symptomsText) => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `You are an AI Medical Triage Assistant for MediConnect. Analyze the following patient symptoms:
"${symptomsText}"

Provide a JSON object with EXACTLY the following keys:
{
  "summary": "Brief 1-2 sentence assessment",
  "suggestedSpecialty": "e.g., Cardiology, General Physician, Neurology, Dermatology, Orthopedics, Pediatrics",
  "urgencyLevel": "Low | Moderate | High | Emergency",
  "recommendedAction": "Actionable advice for patient",
  "keyQuestions": ["1-2 clarifying health questions"]
}
Return ONLY valid JSON without markdown formatting.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim().replace(/```json|```/g, '');
      return JSON.parse(text);
    } catch (err) {
      console.warn('[Gemini AI Notice] API Quota/Model Note:', err.message);
      console.warn('[Gemini AI Notice] Seamlessly using intelligent medical heuristic triage.');
    }
  }

  // Intelligent Heuristic Medical Triage Fallback Engine
  const textLower = symptomsText.toLowerCase();
  let specialty = 'General Physician';
  let urgency = 'Moderate';
  let action = 'Schedule a consultation with a General Physician for a thorough medical evaluation.';

  if (textLower.includes('chest') || textLower.includes('heart') || textLower.includes('breath') || textLower.includes('tightness')) {
    specialty = 'Cardiology';
    urgency = textLower.includes('severe') || textLower.includes('sharp') ? 'Emergency' : 'High';
    action = urgency === 'Emergency' 
      ? 'Seek immediate emergency medical care at the nearest hospital ER.' 
      : 'Consult a Cardiologist as soon as possible for ECG & cardiac screening.';
  } else if (textLower.includes('skin') || textLower.includes('rash') || textLower.includes('acne') || textLower.includes('itch') || textLower.includes('redness')) {
    specialty = 'Dermatology';
    urgency = 'Low';
    action = 'Book an appointment with a Dermatologist. Keep the area clean and avoid scratching.';
  } else if (textLower.includes('joint') || textLower.includes('bone') || textLower.includes('knee') || textLower.includes('back pain') || textLower.includes('fracture')) {
    specialty = 'Orthopedics';
    urgency = 'Moderate';
    action = 'Consult an Orthopedic Specialist. Apply cold/warm compresses and avoid heavy strain.';
  } else if (textLower.includes('child') || textLower.includes('baby') || textLower.includes('toddler')) {
    specialty = 'Pediatrics';
    urgency = 'Moderate';
    action = 'Consult a Pediatrician for age-specific evaluation.';
  } else if (textLower.includes('headache') || textLower.includes('dizziness') || textLower.includes('migraine') || textLower.includes('numbness')) {
    specialty = 'Neurology';
    urgency = textLower.includes('sudden') || textLower.includes('severe') ? 'High' : 'Moderate';
    action = 'Rest in a dark, quiet environment and schedule a Neurologist consultation if persistent.';
  }

  return {
    summary: `Based on your reported symptoms (${symptomsText.slice(0, 65)}...), clinical triage suggests evaluation under ${specialty}.`,
    suggestedSpecialty: specialty,
    urgencyLevel: urgency,
    recommendedAction: action,
    keyQuestions: [
      'How long have you been experiencing these symptoms?',
      'Are you taking any current regular medications?'
    ]
  };
};

const generateConsultationSummary = async (patientNotes, diagnosis) => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `Summarize this clinical encounter concisely for a medical record:
Patient Complaint: ${patientNotes}
Doctor Diagnosis: ${diagnosis}

Provide a 3-bullet clinical summary.`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.warn('[Gemini AI Warning] Falling back to default summary:', err.message);
    }
  }

  return `• Patient presented with: ${patientNotes || 'Standard consultation'}\n• Diagnostic Impression: ${diagnosis}\n• Follow-up plan established with prescribed treatment.`;
};

module.exports = { analyzeSymptoms, generateConsultationSummary };
