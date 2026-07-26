const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUserAccount, getPendingDoctors, verifyDoctor, getAdminStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUserAccount);
router.get('/doctors/pending', getPendingDoctors);
router.patch('/doctors/:id/verify', verifyDoctor);
router.get('/stats', getAdminStats);

module.exports = router;
