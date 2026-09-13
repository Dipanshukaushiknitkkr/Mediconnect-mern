const mongoose = require('mongoose');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');

// @desc    Get real public aggregate platform metrics and verified reviews for Landing Page
// @route   GET /api/v1/stats/public and /api/stats/public
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // Memory Store Fallback
      const approvedDoctors = (global.memoryStore?.doctors || []).filter((d) => d.status === 'APPROVED');
      const appointments = global.memoryStore?.appointments || [];
      const specialties = [...new Set(approvedDoctors.map((d) => d.specialty).filter(Boolean))];
      const avgRating =
        approvedDoctors.length > 0
          ? (approvedDoctors.reduce((acc, d) => acc + (d.rating || 0), 0) / approvedDoctors.length).toFixed(1)
          : '4.9';

      return res.json({
        success: true,
        stats: {
          verifiedDoctors: approvedDoctors.length,
          totalAppointments: appointments.length,
          activeSpecialties: specialties.length,
          averageDoctorRating: parseFloat(avgRating)
        },
        reviews: []
      });
    }

    // Real MongoDB Aggregations
    const [verifiedDoctorsCount, totalAppointmentsCount, distinctSpecialties, ratingAgg, realReviews] =
      await Promise.all([
        DoctorProfile.countDocuments({ status: 'APPROVED' }),
        Appointment.countDocuments({ status: { $in: ['SCHEDULED', 'COMPLETED'] } }),
        DoctorProfile.distinct('specialty', { status: 'APPROVED' }),
        DoctorProfile.aggregate([
          { $match: { status: 'APPROVED' } },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]),
        Review.find()
          .populate('patient', 'name avatar')
          .populate({
            path: 'doctor',
            select: 'name avatar'
          })
          .sort({ createdAt: -1 })
          .limit(6)
      ]);

    const avgRating = ratingAgg.length > 0 && ratingAgg[0].avgRating
      ? parseFloat(ratingAgg[0].avgRating.toFixed(1))
      : 4.9;

    res.json({
      success: true,
      stats: {
        verifiedDoctors: verifiedDoctorsCount,
        totalAppointments: totalAppointmentsCount,
        activeSpecialties: distinctSpecialties.length,
        averageDoctorRating: avgRating
      },
      reviews: realReviews.map((r) => ({
        _id: r._id,
        name: r.patient?.name || 'Anonymous Patient',
        doctor: r.doctor?.name ? `Dr. ${r.doctor.name}` : 'Attending Physician',
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('Error in getPublicStats:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch public stats.' });
  }
};

module.exports = { getPublicStats };
