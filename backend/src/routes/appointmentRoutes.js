const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getBookedSlots,
  getMyAppointments,
  updateAppointmentStatus,
  createPrescription,
  getPrescription
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/booked-slots', getBookedSlots);
router.post('/', protect, createAppointment);
router.get('/', protect, getMyAppointments);
router.get('/my-appointments', protect, getMyAppointments);
router.patch('/:id/status', protect, updateAppointmentStatus);
router.post('/:id/prescription', protect, authorize('DOCTOR'), createPrescription);
router.get('/:id/prescription', protect, getPrescription);

module.exports = router;
