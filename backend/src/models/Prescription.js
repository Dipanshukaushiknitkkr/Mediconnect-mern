const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required']
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g. "500mg"
        frequency: { type: String, required: true }, // e.g. "Twice daily after meals"
        duration: { type: String, required: true } // e.g. "5 days"
      }
    ],
    advice: {
      type: String,
      default: 'Take adequate rest and maintain hydration.'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
