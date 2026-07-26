const mongoose = require('mongoose');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get pending doctor approval applications
// @route   GET /api/admin/doctors/pending
// @access  Private (Admin)
const getPendingDoctors = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const pending = global.memoryStore?.doctors.filter((d) => d.status === 'PENDING') || [];
      return res.json({ success: true, count: pending.length, doctors: pending });
    }

    const pendingDoctors = await DoctorProfile.find({ status: 'PENDING' }).populate('user', 'name email avatar phone createdAt');
    res.json({ success: true, count: pendingDoctors.length, doctors: pendingDoctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject doctor application
// @route   PATCH /api/admin/doctors/:id/verify
// @access  Private (Admin)
const verifyDoctor = async (req, res) => {
  try {
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (mongoose.connection.readyState !== 1) {
      const doc = global.memoryStore?.doctors.find((d) => d._id === req.params.id || d.user?._id === req.params.id);
      if (doc) doc.status = status;
      return res.json({ success: true, message: `Doctor status updated to ${status}`, profile: doc });
    }

    const profile = await DoctorProfile.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('user', 'name email');
    if (!profile) return res.status(404).json({ success: false, message: 'Doctor application not found' });

    res.json({ success: true, message: `Doctor status updated to ${status}`, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Promote or update user role (Admin self-serve promotion)
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin)
const promoteUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['PATIENT', 'DOCTOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    if (mongoose.connection.readyState !== 1) {
      const user = global.memoryStore?.users.find((u) => u._id === req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      user.role = role;
      return res.json({ success: true, message: `User role updated to ${role}`, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: `User '${user.email}' role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get platform administrative analytics & stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const totalPatients = global.memoryStore?.users.filter((u) => u.role === 'PATIENT').length || 0;
      const totalDoctors = global.memoryStore?.users.filter((u) => u.role === 'DOCTOR').length || 0;
      const pendingDoctors = global.memoryStore?.doctors.filter((d) => d.status === 'PENDING').length || 0;
      const approvedDoctors = global.memoryStore?.doctors.filter((d) => d.status === 'APPROVED').length || 0;
      const totalAppointments = global.memoryStore?.appointments.length || 0;
      const totalRevenue = global.memoryStore?.appointments.reduce((sum, a) => sum + (a.amount || 0), 0) || 0;

      return res.json({
        success: true,
        stats: { totalPatients, totalDoctors, pendingDoctors, approvedDoctors, totalAppointments, totalRevenue }
      });
    }

    const totalPatients = await User.countDocuments({ role: 'PATIENT' });
    const totalDoctors = await User.countDocuments({ role: 'DOCTOR' });
    const pendingDoctors = await DoctorProfile.countDocuments({ status: 'PENDING' });
    const approvedDoctors = await DoctorProfile.countDocuments({ status: 'APPROVED' });
    const totalAppointments = await Appointment.countDocuments();

    const revenueData = await Appointment.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.json({
      success: true,
      stats: { totalPatients, totalDoctors, pendingDoctors, approvedDoctors, totalAppointments, totalRevenue }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPendingDoctors, verifyDoctor, promoteUserRole, getAdminStats };
