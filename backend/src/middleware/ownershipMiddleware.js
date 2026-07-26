const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

// Verifies that logged-in user is either the patient, doctor, or system admin for an appointment
const checkAppointmentOwnership = async (req, res, next) => {
  try {
    const appointmentId = req.params.id || req.body.appointmentId;
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Appointment ID is required.' });
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    let appointment = null;
    if (mongoose.connection.readyState === 1) {
      appointment = await Appointment.findById(appointmentId);
    } else {
      appointment = global.memoryStore?.appointments.find((a) => a._id === appointmentId);
    }

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment record not found.' });
    }

    const patientId = appointment.patient?._id ? appointment.patient._id.toString() : appointment.patient.toString();
    const doctorId = appointment.doctor?._id ? appointment.doctor._id.toString() : appointment.doctor.toString();
    const currentUserId = req.user._id.toString();

    if (currentUserId !== patientId && currentUserId !== doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view or modify this appointment.'
      });
    }

    req.appointment = appointment;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { checkAppointmentOwnership };
