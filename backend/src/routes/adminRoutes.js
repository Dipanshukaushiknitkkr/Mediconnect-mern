const express = require('express');
const router = express.Router();
const { getPendingDoctors, verifyDoctor, promoteUserRole, getAdminStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/doctors/pending', getPendingDoctors);
router.patch('/doctors/:id/verify', verifyDoctor);
router.patch('/users/:id/role', promoteUserRole);
router.get('/stats', getAdminStats);

module.exports = router;
