const mongoose = require('mongoose');
const DoctorProfile = require('../models/DoctorProfile');
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');

const getAllDoctors = async (req, res) => {
  try {
    const { specialty, search } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let docs = global.memoryStore?.doctors?.filter((d) => d.status === 'APPROVED') || [];
      if (specialty && specialty !== 'All') {
        docs = docs.filter((d) => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
      }
      if (search) {
        docs = docs.filter(
          (d) =>
            d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            d.specialty?.toLowerCase().includes(search.toLowerCase())
        );
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
    const doctorId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (mongoose.connection.readyState !== 1) {
      const doctor = global.memoryStore?.doctors?.find(
        (d) => d._id === doctorId || d.user?._id === doctorId || d.user === doctorId
      );
      if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

      return res.json({
        success: true,
        doctor,
        reviews: [],
        pagination: { page: 1, limit: 10, totalReviews: 0, totalPages: 1 },
        ratingStats: {
          avgRating: doctor.rating || 4.9,
          totalReviews: doctor.reviewCount || 0,
          breakdown: { 5: doctor.reviewCount || 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      });
    }

    // Support querying by DoctorProfile._id or by User._id
    let query = {};
    if (mongoose.Types.ObjectId.isValid(doctorId)) {
      query = { $or: [{ _id: doctorId }, { user: doctorId }] };
    } else {
      query = { _id: doctorId };
    }

    const doctor = await DoctorProfile.findOne(query).populate('user', 'name email avatar phone');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const doctorUserId = doctor.user?._id || doctor.user;

    // Fetch real reviews with pagination
    const [reviews, totalReviews, ratingAgg] = await Promise.all([
      Review.find({ doctor: doctorUserId })
        .populate('patient', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ doctor: doctorUserId }),
      Review.aggregate([
        { $match: { doctor: new mongoose.Types.ObjectId(doctorUserId) } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            stars5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            stars4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            stars3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            stars2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            stars1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
          }
        }
      ])
    ]);

    const avgRating = ratingAgg.length > 0 && ratingAgg[0].avgRating
      ? parseFloat(ratingAgg[0].avgRating.toFixed(1))
      : doctor.rating || 4.9;

    const breakdown = ratingAgg.length > 0
      ? {
          5: ratingAgg[0].stars5 || 0,
          4: ratingAgg[0].stars4 || 0,
          3: ratingAgg[0].stars3 || 0,
          2: ratingAgg[0].stars2 || 0,
          1: ratingAgg[0].stars1 || 0
        }
      : { 5: totalReviews, 4: 0, 3: 0, 2: 0, 1: 0 };

    res.json({
      success: true,
      doctor,
      reviews: reviews.map((r) => ({
        _id: r._id,
        rating: r.rating,
        comment: r.comment,
        patientName: r.patient?.name || 'Verified Patient',
        patientAvatar: r.patient?.avatar || null,
        createdAt: r.createdAt
      })),
      pagination: {
        page,
        limit,
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit) || 1
      },
      ratingStats: {
        avgRating,
        totalReviews,
        breakdown
      }
    });
  } catch (error) {
    console.error('Error in getDoctorById:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createDoctorReview = async (req, res) => {
  try {
    const { rating, comment, appointmentId } = req.body;
    const doctorProfileId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        message: 'Review recorded successfully in demo mode.',
        review: { rating, comment, createdAt: new Date() }
      });
    }

    let doctor = await DoctorProfile.findOne({
      $or: [{ _id: doctorProfileId }, { user: doctorProfileId }]
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const doctorUserId = doctor.user;

    // Create review
    const newReview = await Review.create({
      doctor: doctorUserId,
      patient: req.user._id,
      appointment: appointmentId || new mongoose.Types.ObjectId(),
      rating: Number(rating),
      comment: comment || ''
    });

    // Update DoctorProfile rating aggregate
    const ratingAgg = await Review.aggregate([
      { $match: { doctor: new mongoose.Types.ObjectId(doctorUserId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (ratingAgg.length > 0) {
      doctor.rating = parseFloat(ratingAgg[0].avgRating.toFixed(1));
      doctor.reviewCount = ratingAgg[0].count;
      await doctor.save();
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      review: newReview
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this consultation.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { availability } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const profile = global.memoryStore?.doctors?.find((d) => d.user?._id === req.user._id);
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
      const profile = global.memoryStore?.doctors?.find((d) => d.user?._id === req.user._id);
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
      {
        specialty,
        qualification,
        experienceYears: Number(experienceYears),
        hourlyFee: Number(hourlyFee),
        hospital,
        bio,
        licenseNumber
      },
      { new: true }
    ).populate('user', 'name email avatar phone');

    res.json({ success: true, message: 'Doctor profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctorReview,
  updateSchedule,
  updateDoctorProfile
};
