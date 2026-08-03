const mongoose = require('mongoose');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { sendDoctorStatusEmail } = require('../services/emailService');

// @desc    Get all registered users for admin management
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const list = global.memoryStore?.users || [];
      return res.json({ success: true, count: list.length, users: list });
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a user account (Patient or Doctor)
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin)
const deleteUserAccount = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    if (mongoose.connection.readyState !== 1) {
      global.memoryStore.users = (global.memoryStore.users || []).filter((u) => u._id !== req.params.id);
      global.memoryStore.doctors = (global.memoryStore.doctors || []).filter(
        (d) => (d.user?._id || d.user)?.toString() !== req.params.id
      );
      return res.json({ success: true, message: 'User account deleted successfully.' });
    }

    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (userToDelete.role === 'DOCTOR') {
      await DoctorProfile.deleteOne({ user: userToDelete._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: `User account '${userToDelete.email}' deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending doctor approval applications
// @route   GET /api/v1/admin/doctors/pending
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
// @route   PATCH /api/v1/admin/doctors/:id/verify
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

    if (profile.user?.email) {
      sendDoctorStatusEmail(profile.user.email, profile.user.name, status).catch((err) =>
        console.error('[Email Notice]:', err.message)
      );
    }

    res.json({ success: true, message: `Doctor status updated to ${status}`, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get platform administrative analytics & stats
// @route   GET /api/v1/admin/stats
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

module.exports = { getAllUsers, deleteUserAccount, getPendingDoctors, verifyDoctor, getAdminStats };
