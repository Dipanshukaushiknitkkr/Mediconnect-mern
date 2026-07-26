const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
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
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    timeSlot: {
      type: String, // e.g. "10:00 AM"
      required: true
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED'
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'REFUNDED'],
      default: 'PAID'
    },
    amount: {
      type: Number,
      required: true
    },
    paymentId: {
      type: String,
      default: () => 'PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    },
    patientNotes: {
      type: String,
      default: ''
    },
    meetingRoomId: {
      type: String,
      default: () => 'room-' + Math.random().toString(36).substr(2, 9)
    },
    isActive: {
      type: Boolean,
      default: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Partial Unique Index: Only enforce double-booking prevention for active SCHEDULED appointments.
// Cancelled or Completed appointments release the slot for re-booking!
appointmentSchema.index(
  { doctor: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: 'SCHEDULED' } }
);
appointmentSchema.index({ patient: 1, createdAt: -1 });
appointmentSchema.index({ status: 1, date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
