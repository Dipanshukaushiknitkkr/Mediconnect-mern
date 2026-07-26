const mongoose = require('mongoose');
const { analyzeSymptoms } = require('../services/geminiService');
const DoctorProfile = require('../models/DoctorProfile');

// @desc    Perform AI symptom triage & recommended doctor matching
// @route   POST /api/ai/triage
// @access  Public / Private
const triageSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || symptoms.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please describe your symptoms.' });
    }

    const aiResult = await analyzeSymptoms(symptoms);

    let recommendedDoctors = [];

    if (mongoose.connection.readyState !== 1) {
      // Memory Store Fallback
      let docs = global.memoryStore?.doctors.filter((d) => d.status === 'APPROVED') || [];
      recommendedDoctors = docs.filter((d) => 
        d.specialty.toLowerCase().includes(aiResult.suggestedSpecialty.toLowerCase())
      );

      if (recommendedDoctors.length === 0) {
        recommendedDoctors = docs.slice(0, 3);
      }
    } else {
      // MongoDB Path
      recommendedDoctors = await DoctorProfile.find({
        status: 'APPROVED',
        specialty: new RegExp(aiResult.suggestedSpecialty, 'i')
      }).populate('user', 'name email avatar').limit(3);

      if (recommendedDoctors.length === 0) {
        recommendedDoctors = await DoctorProfile.find({ status: 'APPROVED' })
          .populate('user', 'name email avatar')
          .sort({ rating: -1 })
          .limit(3);
      }
    }

    res.json({
      success: true,
      triage: aiResult,
      recommendedDoctors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { triageSymptoms };
