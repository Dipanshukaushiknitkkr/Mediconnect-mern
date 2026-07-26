const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, updateSchedule, updateDoctorProfile } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.put('/schedule', protect, authorize('DOCTOR'), updateSchedule);
router.put('/profile', protect, authorize('DOCTOR'), updateDoctorProfile);

module.exports = router;
