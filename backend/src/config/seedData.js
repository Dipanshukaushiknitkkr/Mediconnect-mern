const mongoose = require('mongoose');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');

// Global In-Memory Store for Mock Fallback when MongoDB daemon is offline
global.memoryStore = {
  users: [
    {
      _id: 'user-admin-1',
      name: 'System Administrator',
      email: 'admin@mediconnect.com',
      password: 'admin123',
      role: 'ADMIN',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    },
    {
      _id: 'user-patient-1',
      name: 'John Doe',
      email: 'patient@mediconnect.com',
      password: 'patient123',
      role: 'PATIENT',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe'
    },
    {
      _id: 'user-doc-1',
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@mediconnect.com',
      password: 'doctor123',
      role: 'DOCTOR',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face'
    },
    {
      _id: 'user-doc-2',
      name: 'Dr. Rajesh Sharma',
      email: 'rajesh.sharma@mediconnect.com',
      password: 'doctor123',
      role: 'DOCTOR',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face'
    },
    {
      _id: 'user-doc-3',
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@mediconnect.com',
      password: 'doctor123',
      role: 'DOCTOR',
      avatar: 'https://images.unsplash.com/photo-1594824813566-81a171d9d936?w=300&h=300&fit=crop&crop=face'
    }
  ],
  doctors: [
    {
      _id: 'doc-prof-1',
      user: {
        _id: 'user-doc-1',
        name: 'Dr. Sarah Jenkins',
        email: 'sarah.jenkins@mediconnect.com',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face'
      },
      specialty: 'Cardiology',
      qualification: 'MD, FACC - Harvard Medical',
      experienceYears: 12,
      hourlyFee: 90,
      hospital: 'St. Jude Heart Institute',
      bio: 'Senior Cardiologist specializing in preventive heart care, arrhythmia, and hypertension management.',
      status: 'APPROVED',
      rating: 4.9,
      reviewCount: 28,
      licenseNumber: 'LIC-984210'
    },
    {
      _id: 'doc-prof-2',
      user: {
        _id: 'user-doc-2',
        name: 'Dr. Rajesh Sharma',
        email: 'rajesh.sharma@mediconnect.com',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face'
      },
      specialty: 'Dermatology',
      qualification: 'MD (Dermatology), AIIMS',
      experienceYears: 8,
      hourlyFee: 65,
      hospital: 'Apollo Skin Care Center',
      bio: 'Consultant Dermatologist expertise in clinical dermatology, laser therapy, and skin allergy treatment.',
      status: 'APPROVED',
      rating: 4.8,
      reviewCount: 19,
      licenseNumber: 'LIC-771239'
    },
    {
      _id: 'doc-prof-3',
      user: {
        _id: 'user-doc-3',
        name: 'Dr. Elena Rostova',
        email: 'elena.rostova@mediconnect.com',
        avatar: 'https://images.unsplash.com/photo-1594824813566-81a171d9d936?w=300&h=300&fit=crop&crop=face'
      },
      specialty: 'Neurology',
      qualification: 'Ph.D. Neuro-Oncology, Oxford',
      experienceYears: 15,
      hourlyFee: 120,
      hospital: 'Johns Hopkins Medicine',
      bio: 'Specialist in migraine management, cognitive disorders, and neuro-rehabilitation.',
      status: 'APPROVED',
      rating: 5.0,
      reviewCount: 34,
      licenseNumber: 'LIC-662914'
    }
  ],
  appointments: [],
  prescriptions: []
};

const seedDemoData = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.log('[Seed] Memory mode initialized with 5 demo accounts & 3 verified doctors.');
    return;
  }

  try {
    // 1. Ensure Patient Account Exists
    let patient = await User.findOne({ email: 'patient@mediconnect.com' });
    if (!patient) {
      patient = await User.create({
        name: 'John Doe',
        email: 'patient@mediconnect.com',
        password: 'patient123',
        role: 'PATIENT',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe'
      });
      console.log('✅ Demo Patient account seeded in MongoDB Atlas.');
    }

    // 2. Ensure Doctor Accounts & Profiles Exist
    for (const memDoc of global.memoryStore.doctors) {
      let docUser = await User.findOne({ email: memDoc.user.email });
      if (!docUser) {
        docUser = await User.create({
          name: memDoc.user.name,
          email: memDoc.user.email,
          password: 'doctor123',
          role: 'DOCTOR',
          avatar: memDoc.user.avatar
        });
      }

      let docProfile = await DoctorProfile.findOne({ user: docUser._id });
      if (!docProfile) {
        await DoctorProfile.create({
          user: docUser._id,
          specialty: memDoc.specialty,
          qualification: memDoc.qualification,
          experienceYears: memDoc.experienceYears,
          hourlyFee: memDoc.hourlyFee,
          hospital: memDoc.hospital,
          bio: memDoc.bio,
          status: 'APPROVED',
          rating: memDoc.rating,
          reviewCount: memDoc.reviewCount,
          licenseNumber: memDoc.licenseNumber
        });
        console.log(`✅ Demo Doctor '${docUser.name}' seeded in MongoDB Atlas.`);
      }
    }
  } catch (err) {
    console.warn('[Seed Warning]: Could not seed demo accounts:', err.message);
  }
};

module.exports = seedDemoData;
