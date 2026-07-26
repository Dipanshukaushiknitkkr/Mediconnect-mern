const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, 'Rating (1-5) is required.'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    }
  },
  { timestamps: true }
);

// Compound Index: One review per appointment
reviewSchema.index({ appointment: 1 }, { unique: true });
reviewSchema.index({ doctor: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
