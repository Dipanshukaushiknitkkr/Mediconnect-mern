const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const Prescription = require('../models/Prescription');

// @desc    Create a new appointment booking
// @route   POST /api/v1/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, patientNotes } = req.body;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Please provide doctorId, date, and timeSlot.' });
    }

    if (mongoose.connection.readyState !== 1) {
      const doc = global.memoryStore.doctors.find(
        (d) => d.user?._id === doctorId || d._id === doctorId || d.user === doctorId
      );
      const doctorUser = doc?.user || { _id: doctorId, name: 'Dr. Medical Specialist', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Doc' };

      // Check if memory store already has a SCHEDULED appointment for this slot
      const existingScheduled = (global.memoryStore.appointments || []).find(
        (a) =>
          (a.doctor?._id || a.doctor)?.toString() === doctorId.toString() &&
          a.date === date &&
          a.timeSlot === timeSlot &&
          a.status === 'SCHEDULED'
      );

      if (existingScheduled) {
        return res.status(409).json({
          success: false,
          message: 'This doctor is already booked for the selected date and time slot. Please choose a different slot.'
        });
      }

      const appointment = {
        _id: 'apt-' + Date.now(),
        patient: global.memoryStore.users.find((u) => u._id === req.user._id) || req.user,
        doctor: doctorUser,
        date,
        timeSlot,
        amount: doc ? doc.hourlyFee : 75,
        status: 'SCHEDULED',
        paymentStatus: 'PAID',
        meetingRoomId: 'room-' + Math.random().toString(36).substr(2, 9),
        patientNotes: patientNotes || '',
        createdAt: new Date()
      };

      if (!global.memoryStore.appointments) global.memoryStore.appointments = [];
      global.memoryStore.appointments.unshift(appointment);
      return res.status(201).json({ success: true, appointment });
    }

    // Find Doctor Profile flexible by User ID or Profile ID
    let doctorProfile = await DoctorProfile.findOne({
      $or: [{ user: doctorId }, { _id: doctorId }]
    });

    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const doctorUserId = doctorProfile.user._id || doctorProfile.user;

    // 1. Check if an ACTIVE (SCHEDULED) appointment exists for this slot
    const activeBooking = await Appointment.findOne({
      doctor: doctorUserId,
      date,
      timeSlot,
      status: 'SCHEDULED'
    });

    if (activeBooking) {
      return res.status(409).json({
        success: false,
        message: 'This doctor is already booked for the selected date and time slot. Please choose a different slot.'
      });
    }

    // 2. Check if a CANCELLED appointment exists for this slot -> Reuse/Freed slot!
    const cancelledBooking = await Appointment.findOne({
      doctor: doctorUserId,
      date,
      timeSlot,
      status: 'CANCELLED'
    });

    if (cancelledBooking) {
      cancelledBooking.patient = req.user._id;
      cancelledBooking.status = 'SCHEDULED';
      cancelledBooking.paymentStatus = 'PAID';
      cancelledBooking.amount = doctorProfile.hourlyFee;
      cancelledBooking.patientNotes = patientNotes || '';
      cancelledBooking.meetingRoomId = 'room-' + Math.random().toString(36).substr(2, 9);
      await cancelledBooking.save();

      const populated = await Appointment.findById(cancelledBooking._id)
        .populate('doctor', 'name email avatar')
        .populate('patient', 'name email avatar');

      if (req.io) {
        req.io.to(`user-${populated.patient._id}`).emit('appointment-updated', populated);
        req.io.to(`user-${populated.doctor._id}`).emit('appointment-updated', populated);
      }

      return res.status(201).json({ success: true, appointment: populated });
    }

    // 3. Create fresh appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorUserId,
      date,
      timeSlot,
      amount: doctorProfile.hourlyFee,
      patientNotes: patientNotes || ''
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('doctor', 'name email avatar')
      .populate('patient', 'name email avatar');

    if (req.io) {
      req.io.to(`user-${populated.patient._id}`).emit('appointment-updated', populated);
      req.io.to(`user-${populated.doctor._id}`).emit('appointment-updated', populated);
    }

    res.status(201).json({ success: true, appointment: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This doctor is already booked for the selected date and time slot. Please choose a different slot.'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get booked time slots for a doctor on a specific date (ONLY SCHEDULED appointments block slots)
// @route   GET /api/v1/appointments/booked-slots
// @access  Public
const getBookedSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'Please provide doctorId and date.' });
    }

    if (mongoose.connection.readyState !== 1) {
      const booked = (global.memoryStore.appointments || [])
        .filter(
          (a) =>
            (a.doctor?._id || a.doctor)?.toString() === doctorId.toString() &&
            a.date === date &&
            a.status === 'SCHEDULED'
        )
        .map((a) => a.timeSlot);
      return res.json({ success: true, bookedSlots: booked });
    }

    let doctorProfile = await DoctorProfile.findOne({
      $or: [{ user: doctorId }, { _id: doctorId }]
    });

    const doctorUserId = doctorProfile ? doctorProfile.user._id || doctorProfile.user : doctorId;

    // Query ONLY SCHEDULED appointments. Cancelled/Completed appointments do NOT block slots!
    const activeAppointments = await Appointment.find({
      doctor: doctorUserId,
      date,
      status: 'SCHEDULED'
    }).select('timeSlot');

    const bookedSlots = activeAppointments.map((a) => a.timeSlot);
    res.json({ success: true, bookedSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get appointments for current logged in user (Patient or Doctor)
// @route   GET /api/v1/appointments
// @access  Private
const getMyAppointments = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();

    if (mongoose.connection.readyState !== 1) {
      let list = global.memoryStore.appointments || [];
      if (req.user.role === 'DOCTOR') {
        list = list.filter((a) => (a.doctor?._id || a.doctor)?.toString() === currentUserId);
      } else {
        list = list.filter((a) => (a.patient?._id || a.patient)?.toString() === currentUserId);
      }
      return res.json({ success: true, count: list.length, appointments: list });
    }

    let query = {};
    if (req.user.role === 'DOCTOR') query.doctor = req.user._id;
    else query.patient = req.user._id;

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name email avatar')
      .populate('patient', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update status of an appointment (e.g. SCHEDULED, COMPLETED, CANCELLED)
// @route   PATCH /api/v1/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    if (mongoose.connection.readyState !== 1) {
      const apt = global.memoryStore.appointments?.find((a) => a._id === req.params.id);
      if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });
      apt.status = status;
      return res.json({ success: true, message: `Appointment status updated to ${status}`, appointment: apt });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this appointment.' });
    }

    // Only doctors/admins can mark COMPLETED. Either party (or admin) can CANCEL.
    if (status === 'COMPLETED' && !(isDoctor || isAdmin)) {
      return res.status(403).json({ success: false, message: 'Only the attending doctor can mark a consultation complete.' });
    }

    appointment.status = status;
    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('doctor', 'name email avatar')
      .populate('patient', 'name email avatar');

    if (req.io) {
      req.io.to(`user-${populated.patient._id}`).emit('appointment-updated', populated);
      req.io.to(`user-${populated.doctor._id}`).emit('appointment-updated', populated);
    }

    res.json({ success: true, message: `Appointment status updated to ${status}`, appointment: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Issue prescription for appointment
// @route   POST /api/v1/appointments/:id/prescription
// @access  Private (Doctor)
const createPrescription = async (req, res) => {
  try {
    const { diagnosis, medicines, advice } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const rx = {
        _id: 'rx-' + Date.now(),
        appointment: req.params.id,
        diagnosis,
        medicines,
        advice
      };
      if (!global.memoryStore.prescriptions) global.memoryStore.prescriptions = [];
      global.memoryStore.prescriptions.push(rx);

      const apt = global.memoryStore.appointments?.find((a) => a._id === req.params.id);
      if (apt) apt.status = 'COMPLETED';

      return res.status(201).json({ success: true, prescription: rx });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';
    if (!isDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the attending doctor can create a prescription for this appointment.' });
    }

    let prescription = await Prescription.findOne({ appointment: appointment._id });
    if (prescription) {
      prescription.diagnosis = diagnosis;
      prescription.medicines = medicines;
      prescription.advice = advice;
      await prescription.save();
    } else {
      prescription = await Prescription.create({
        appointment: appointment._id,
        patient: appointment.patient,
        doctor: req.user._id,
        diagnosis,
        medicines,
        advice
      });
    }

    appointment.status = 'COMPLETED';
    await appointment.save();

    const populatedApt = await Appointment.findById(appointment._id)
      .populate('doctor', 'name email avatar')
      .populate('patient', 'name email avatar');

    if (req.io) {
      req.io.to(`user-${populatedApt.patient._id}`).emit('appointment-updated', populatedApt);
      req.io.to(`user-${populatedApt.doctor._id}`).emit('appointment-updated', populatedApt);
    }

    res.status(201).json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get prescription for an appointment
// @route   GET /api/v1/appointments/:id/prescription
// @access  Private
const getPrescription = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const rx = global.memoryStore.prescriptions?.find((p) => p.appointment === req.params.id);
      if (!rx) return res.status(404).json({ success: false, message: 'Prescription not found' });
      return res.json({ success: true, prescription: rx });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this prescription.' });
    }

    const prescription = await Prescription.findOne({ appointment: req.params.id })
      .populate('doctor', 'name email avatar')
      .populate('patient', 'name email avatar');

    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    res.json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAppointment,
  getBookedSlots,
  getMyAppointments,
  updateAppointmentStatus,
  createPrescription,
  getPrescription
};
