const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      trim: true
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required']
    },
    experienceYears: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: 0
    },
    hourlyFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: 0
    },
    bio: {
      type: String,
      default: ''
    },
    hospital: {
      type: String,
      default: 'MediConnect Health Clinic'
    },
    licenseNumber: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    rating: {
      type: Number,
      default: 4.8
    },
    reviewCount: {
      type: Number,
      default: 12
    },
    isActive: {
      type: Boolean,
      default: true
    },
    deletedAt: {
      type: Date,
      default: null
    },
    availability: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        slots: [{ type: String }]
      }
    ]
  },
  { timestamps: true }
);

doctorProfileSchema.index({ status: 1, specialty: 1 });
doctorProfileSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
