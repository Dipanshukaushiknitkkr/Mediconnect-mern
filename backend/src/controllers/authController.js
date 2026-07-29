const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const { sendOtpEmail } = require('../services/emailService');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production!');
    }
    return 'mediconnect_super_secret_placement_key_2026';
  }
  return secret;
};

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), { expiresIn: '30d' });
};

// @desc    Register a new patient or doctor (Sends 6-Digit Email OTP)
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, specialty, qualification, experienceYears, hourlyFee, licenseNumber, hospital, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Public Admin registration is disabled for security. Use CLI script or Admin promotion.'
      });
    }

    const userRole = role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT';
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (mongoose.connection.readyState !== 1) {
      if (!global.memoryStore) global.memoryStore = { users: [], doctors: [] };
      let existing = global.memoryStore.users.find((u) => u.email === normalizedEmail);
      if (existing) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        _id: 'user-' + Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: userRole,
        phone: '',
        bloodGroup: 'O+',
        allergies: 'None',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        isEmailVerified: false,
        emailOtp: otp,
        emailOtpExpires: otpExpires
      };

      global.memoryStore.users.push(user);

      if (userRole === 'DOCTOR') {
        const doctorProfile = {
          _id: 'doc-' + Date.now(),
          user,
          specialty: specialty || 'General Physician',
          qualification: qualification || 'MBBS',
          experienceYears: Number(experienceYears) || 5,
          hourlyFee: Number(hourlyFee) || 50,
          hospital: hospital || 'MediConnect Clinic',
          licenseNumber: licenseNumber || 'LIC-' + Date.now(),
          status: 'PENDING',
          rating: 4.8,
          reviewCount: 0
        };
        if (!global.memoryStore.doctors) global.memoryStore.doctors = [];
        global.memoryStore.doctors.push(doctorProfile);
      }

      await sendOtpEmail(normalizedEmail, otp, name.trim());

      return res.status(201).json({
        success: true,
        requiresOtp: true,
        email: normalizedEmail,
        message: 'Registration successful! Please enter the 6-digit OTP code.',
        otpPreview: otp
      });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: userRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      isEmailVerified: false,
      emailOtp: otp,
      emailOtpExpires: otpExpires
    });

    if (userRole === 'DOCTOR') {
      await DoctorProfile.create({
        user: user._id,
        specialty: specialty || 'General Physician',
        qualification: qualification || 'MBBS',
        experienceYears: Number(experienceYears) || 5,
        hourlyFee: Number(hourlyFee) || 50,
        licenseNumber: licenseNumber || 'LIC-' + Math.floor(100000 + Math.random() * 900000),
        hospital: hospital || 'MediConnect Healthcare Center',
        bio: bio || 'Medical specialist providing online telehealth consultations.',
        status: 'PENDING'
      });
    }

    await sendOtpEmail(normalizedEmail, otp, name.trim());

    res.status(201).json({
      success: true,
      requiresOtp: true,
      email: normalizedEmail,
      message: 'Registration successful! Please enter the 6-digit OTP code.',
      otpPreview: otp
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify 6-digit Email OTP & activate account
// @route   POST /api/v1/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and 6-digit OTP code.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState !== 1) {
      const user = global.memoryStore?.users.find((u) => u.email === normalizedEmail);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User account not found.' });
      }

      if (user.emailOtp !== otp || new Date() > new Date(user.emailOtpExpires)) {
        return res.status(400).json({ success: false, message: 'Invalid or expired 6-digit OTP code.' });
      }

      user.isEmailVerified = true;
      delete user.emailOtp;
      delete user.emailOtpExpires;

      const doctorProfile = user.role === 'DOCTOR' ? global.memoryStore?.doctors.find((d) => d.user?._id === user._id) : null;
      const token = generateToken(user._id);

      return res.json({
        success: true,
        message: 'Email verified successfully!',
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, doctorProfile }
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (user.emailOtp !== otp || new Date() > new Date(user.emailOtpExpires)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired 6-digit OTP code.' });
    }

    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    await user.save();

    let doctorProfile = null;
    if (user.role === 'DOCTOR') {
      doctorProfile = await DoctorProfile.findOne({ user: user._id });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, doctorProfile }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend 6-digit Email OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (mongoose.connection.readyState !== 1) {
      const user = global.memoryStore?.users.find((u) => u.email === normalizedEmail);
      if (!user) return res.status(404).json({ success: false, message: 'User account not found.' });

      user.emailOtp = newOtp;
      user.emailOtpExpires = newExpires;
      await sendOtpEmail(normalizedEmail, newOtp, user.name);

      return res.json({
        success: true,
        message: 'A new 6-digit OTP has been sent to your email.',
        otpPreview: newOtp
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ success: false, message: 'User account not found.' });

    user.emailOtp = newOtp;
    user.emailOtpExpires = newExpires;
    await user.save();

    await sendOtpEmail(normalizedEmail, newOtp, user.name);

    res.json({
      success: true,
      message: 'A new 6-digit OTP has been sent to your email.',
      otpPreview: newOtp
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user & return JWT token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState !== 1) {
      const user = global.memoryStore?.users.find((u) => u.email === normalizedEmail);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      let isMatch = false;
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = user.password === password;
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const doctorProfile = user.role === 'DOCTOR' ? global.memoryStore?.doctors.find((d) => d.user?._id === user._id) : null;
      const token = generateToken(user._id);
      return res.json({
        success: true,
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, doctorProfile }
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    let doctorProfile = null;
    if (user.role === 'DOCTOR') {
      doctorProfile = await DoctorProfile.findOne({ user: user._id });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, doctorProfile }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const user = global.memoryStore?.users.find((u) => u._id === req.user._id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const doctorProfile = user.role === 'DOCTOR' ? global.memoryStore?.doctors.find((d) => d.user?._id === user._id) : null;
      return res.json({
        success: true,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, doctorProfile }
      });
    }

    const user = await User.findById(req.user._id);
    let doctorProfile = null;
    if (user.role === 'DOCTOR') {
      doctorProfile = await DoctorProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, doctorProfile }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile details
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, bloodGroup, allergies, emergencyContact } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const user = global.memoryStore?.users.find((u) => u._id === req.user._id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (bloodGroup) user.bloodGroup = bloodGroup;
      if (allergies) user.allergies = allergies;
      if (emergencyContact) user.emergencyContact = emergencyContact;

      return res.json({ success: true, message: 'Profile updated successfully', user });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, bloodGroup, allergies, emergencyContact },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, verifyOtp, resendOtp, loginUser, getMe, updateUserProfile };
