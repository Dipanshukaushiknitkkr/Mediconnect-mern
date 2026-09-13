import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BookingModal from '../components/BookingModal';
import usePageMeta from '../hooks/usePageMeta';
import {
  ArrowLeft,
  Star,
  Building2,
  ShieldCheck,
  Calendar,
  Clock,
  Award,
  Video,
  FileText,
  MessageSquare,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
  Lock,
  UserCheck
} from 'lucide-react';

const DoctorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [doctor, setDoctor] = useState(null);

  usePageMeta(
    doctor ? `${doctor.user?.name || 'Physician'} (${doctor.specialty})` : 'Doctor Profile',
    doctor?.bio || 'View doctor qualifications, hospital affiliations, ratings, reviews, and schedule a video consultation.'
  );
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    avgRating: 4.9,
    totalReviews: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalReviews: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchDoctorData(pagination.page);
  }, [id, pagination.page]);

  const fetchDoctorData = async (page = 1) => {
    try {
      setLoading(true);
      const res = await API.get(`/doctors/${id}`, {
        params: { page, limit: 10 }
      });

      if (res.data?.success) {
        setDoctor(res.data.doctor);
        setReviews(res.data.reviews || []);
        if (res.data.ratingStats) {
          setRatingStats(res.data.ratingStats);
        }
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Fetch doctor profile error:', err.message);
      toast.error('Unable to load doctor profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      const reviewsElement = document.getElementById('reviews-section');
      if (reviewsElement) {
        reviewsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit a patient review.');
      navigate('/login');
      return;
    }

    if (!reviewComment.trim()) {
      toast.error('Please write a brief comment describing your consultation experience.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await API.post(`/doctors/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.data?.success) {
        toast.success('Thank you! Your review has been submitted.');
        setReviewComment('');
        setShowReviewForm(false);
        fetchDoctorData(1);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review.';
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading && !doctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <div className="h-4 w-32 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="clinical-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-24 bg-slate-800 rounded-lg" />
                  <div className="h-7 w-48 bg-slate-800 rounded-lg" />
                  <div className="h-4 w-64 bg-slate-800 rounded-lg" />
                </div>
              </div>
            </div>
            <div className="clinical-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-4">
              <div className="h-5 w-36 bg-slate-800 rounded-lg" />
              <div className="h-16 w-full bg-slate-800/60 rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="clinical-card p-6 rounded-2xl border border-white/5 space-y-6">
              <div className="h-8 w-28 bg-slate-800 rounded-lg" />
              <div className="h-12 w-full bg-slate-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Doctor Profile Not Found</h2>
        <p className="text-xs text-slate-400">The requested physician profile could not be found.</p>
        <Link to="/" className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl clinical-btn-primary text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Doctor Directory</span>
        </Link>
      </div>
    );
  }

  const doctorName = doctor.user?.name || 'Medical Specialist';
  const doctorAvatar = doctor.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Doctor';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back to Directory Nav */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Doctors</span>
        </Link>
      </div>

      {/* Main Grid: Doctor Header & Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols): Doctor Bio, Credentials, Reviews */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Doctor Header Card */}
          <div className="clinical-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <img
                src={doctorAvatar}
                alt={doctorName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-sky-500/30 shadow-xl"
              />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {doctor.specialty}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Physician</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{doctorName}</h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">{doctor.qualification}</p>

                <div className="flex items-center space-x-4 pt-1 text-xs text-slate-400">
                  <div className="flex items-center text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                    <span>{ratingStats.avgRating}</span>
                    <span className="text-slate-400 font-normal ml-1">({ratingStats.totalReviews} reviews)</span>
                  </div>
                  <span>•</span>
                  <span>License: <strong className="text-slate-200 font-mono">{doctor.licenseNumber || 'Verified'}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Details Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/5 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Hospital</span>
                <p className="font-semibold text-white truncate flex items-center">
                  <Building2 className="w-3.5 h-3.5 text-sky-400 mr-1.5 shrink-0" />
                  <span className="truncate">{doctor.hospital}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Experience</span>
                <p className="font-semibold text-white truncate flex items-center">
                  <Award className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
                  <span>{doctor.experienceYears} Years Clinical</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Consultation</span>
                <p className="font-semibold text-white truncate flex items-center">
                  <Video className="w-3.5 h-3.5 text-teal-400 mr-1.5 shrink-0" />
                  <span>Encrypted 1080p Video</span>
                </p>
              </div>
            </div>
          </div>

          {/* About Doctor Bio & Practice */}
          <div className="clinical-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">About {doctorName}</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {doctor.bio || `${doctorName} is a certified specialist in ${doctor.specialty} with ${doctor.experienceYears} years of medical experience at ${doctor.hospital}. Available for comprehensive virtual consultations, symptom review, and digital prescriptions on MediConnect.`}
            </p>

            <div className="pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="space-y-2">
                <h3 className="font-semibold text-white">Clinical Focus Areas:</h3>
                <ul className="space-y-1.5 text-slate-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Comprehensive {doctor.specialty} Teleconsultation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Medication Review & Pharmacy Prescriptions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Follow-Up Care & Diagnostic Guidance</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-white">Telehealth Standards:</h3>
                <ul className="space-y-1.5 text-slate-400">
                  <li className="flex items-center space-x-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>256-Bit Encrypted Peer-to-Peer Stream</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Immediate Digital Rx & Receipt Generation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Real Reviews & Ratings Section */}
          <div id="reviews-section" className="clinical-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Patient Reviews & Ratings</h2>
                <p className="text-xs text-slate-400">Verified feedback from consultations with this physician.</p>
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-3.5 py-2 rounded-xl clinical-btn-primary text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{showReviewForm ? 'Close Form' : 'Write a Review'}</span>
              </button>
            </div>

            {/* Rating Breakdown Banner */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Overall Score */}
              <div className="md:col-span-4 text-center space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums">{ratingStats.avgRating}</div>
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(ratingStats.avgRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">{ratingStats.totalReviews} Total Patient Ratings</p>
              </div>

              {/* Star Distribution Progress Bars */}
              <div className="md:col-span-8 space-y-1.5 text-xs">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingStats.breakdown?.[stars] || 0;
                  const percent = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0;

                  return (
                    <div key={stars} className="flex items-center space-x-3">
                      <span className="w-8 text-[11px] text-slate-400 flex items-center">
                        {stars} <Star className="w-2.5 h-2.5 fill-slate-400 text-slate-400 ml-0.5" />
                      </span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-8 text-[11px] text-slate-400 text-right tabular-nums">{count}</span>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Review Submission Form (Expandable) */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="p-5 rounded-xl bg-slate-900 border border-sky-500/30 space-y-4 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold text-white">Share Your Consultation Experience</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rating</label>
                  <div className="flex items-center space-x-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            (reviewHoverRating || reviewRating) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-amber-300 ml-2">{reviewRating} Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Feedback</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="How was the doctor's communication, advice, and punctuality?"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 rounded-xl clinical-btn-primary text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingReview ? 'Submitting...' : 'Submit Review'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={r.patientAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.patientName}`}
                          alt={r.patientName}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white">{r.patientName}</h4>
                          <span className="text-[10px] text-emerald-400 font-medium">Verified Consultation</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-0.5 justify-end">
                          {[...Array(r.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {r.comment}
                    </p>
                  </div>
                ))}

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="pt-4 flex items-center justify-between border-t border-white/5 text-xs">
                    <span className="text-slate-400">
                      Page <strong className="text-white">{pagination.page}</strong> of <strong className="text-white">{pagination.totalPages}</strong>
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="px-3 py-1.5 rounded-lg clinical-card border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 flex items-center space-x-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="px-3 py-1.5 rounded-lg clinical-card border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 flex items-center space-x-1"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
                <h4 className="text-xs font-bold text-white">No Patient Reviews Yet</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Be the first to share your experience with {doctorName} after your telehealth visit.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Right Column (4 cols): Sticky Booking Card & Rates */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          
          <div className="clinical-card p-6 rounded-2xl border border-sky-500/20 shadow-xl space-y-6">
            
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Consultation Fee</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-extrabold text-white tabular-nums">${doctor.hourlyFee}</span>
                <span className="text-xs text-slate-400">/ video visit</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Format:</span>
                <span className="font-semibold text-white">Private HD Video Call</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Prescription:</span>
                <span className="font-semibold text-emerald-400">Digital Rx Included</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Availability:</span>
                <span className="font-semibold text-sky-400">Today & Upcoming Slots</span>
              </div>
            </div>

            <button
              onClick={() => setBookingOpen(true)}
              className="w-full py-3.5 rounded-xl clinical-btn-primary font-bold text-white text-sm shadow-lg flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            <div className="pt-2 text-center text-[11px] text-slate-500 space-y-1">
              <p>🔒 256-Bit SSL Encrypted Healthcare Portal</p>
              <p>Free cancellation up to appointment time</p>
            </div>

          </div>

          {/* Quick Doctor Summary Card */}
          <div className="clinical-card p-5 rounded-2xl border border-white/5 space-y-3 text-xs text-slate-400">
            <h4 className="font-bold text-white text-xs">Why Consult on MediConnect?</h4>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Verified medical credentials and active board licensing.</span>
              </li>
              <li className="flex items-start space-x-2">
                <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>Official digital prescription sent directly to your account.</span>
              </li>
              <li className="flex items-start space-x-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>No waiting rooms — start your call with 1 click.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Booking Modal */}
      {bookingOpen && (
        <BookingModal
          doctor={doctor}
          isOpen={bookingOpen}
          onClose={() => setBookingOpen(false)}
        />
      )}

    </div>
  );
};

export default DoctorProfilePage;
