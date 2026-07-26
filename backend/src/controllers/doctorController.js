const mongoose = require('mongoose');
const DoctorProfile = require('../models/DoctorProfile');

const getAllDoctors = async (req, res) => {
  try {
    const { specialty, search } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let docs = global.memoryStore.doctors.filter((d) => d.status === 'APPROVED');
      if (specialty && specialty !== 'All') {
        docs = docs.filter((d) => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
      }
      if (search) {
        docs = docs.filter((d) => d.user?.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase()));
      }
      return res.json({ success: true, count: docs.length, doctors: docs });
    }

    let query = { status: 'APPROVED' };
    if (specialty && specialty !== 'All') {
      query.specialty = new RegExp(specialty, 'i');
    }

    let profiles = await DoctorProfile.find(query).populate('user', 'name email avatar phone');
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      profiles = profiles.filter((p) => searchRegex.test(p.user?.name) || searchRegex.test(p.specialty));
    }

    res.json({ success: true, count: profiles.length, doctors: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const doctor = global.memoryStore.doctors.find((d) => d.user?._id === req.params.id);
      if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return res.json({ success: true, doctor });
    }

    const doctor = await DoctorProfile.findOne({ user: req.params.id }).populate('user', 'name email avatar phone');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { availability } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const profile = global.memoryStore.doctors.find((d) => d.user?._id === req.user._id);
      if (profile) profile.availability = availability;
      return res.json({ success: true, message: 'Schedule updated successfully', profile });
    }

    const profile = await DoctorProfile.findOneAndUpdate({ user: req.user._id }, { availability }, { new: true });
    res.json({ success: true, message: 'Schedule updated successfully', profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    const { specialty, qualification, experienceYears, hourlyFee, hospital, bio, licenseNumber } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const profile = global.memoryStore.doctors.find((d) => d.user?._id === req.user._id);
      if (!profile) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

      if (specialty) profile.specialty = specialty;
      if (qualification) profile.qualification = qualification;
      if (experienceYears) profile.experienceYears = Number(experienceYears);
      if (hourlyFee) profile.hourlyFee = Number(hourlyFee);
      if (hospital) profile.hospital = hospital;
      if (bio) profile.bio = bio;
      if (licenseNumber) profile.licenseNumber = licenseNumber;

      return res.json({ success: true, message: 'Doctor profile updated successfully', profile });
    }

    const profile = await DoctorProfile.findOneAndUpdate(
      { user: req.user._id },
      { specialty, qualification, experienceYears: Number(experienceYears), hourlyFee: Number(hourlyFee), hospital, bio, licenseNumber },
      { new: true }
    ).populate('user', 'name email avatar phone');

    res.json({ success: true, message: 'Doctor profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllDoctors, getDoctorById, updateSchedule, updateDoctorProfile };
