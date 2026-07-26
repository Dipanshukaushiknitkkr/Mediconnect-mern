import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import DoctorCard from '../components/DoctorCard';
import BookingModal from '../components/BookingModal';
import SkeletonCard from '../components/SkeletonCard';
import { Sparkles, Search, Stethoscope, Video, ShieldCheck, Activity, Users, ArrowRight, HeartPulse, CheckCircle2, Star, Clock, FileText } from 'lucide-react';

const LandingPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState(null);

  const specialties = ['All', 'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics'];

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await API.get('/doctors', {
        params: { specialty: selectedSpecialty, search: searchQuery }
      });
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      console.error('Fetch doctors error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="space-y-24 pb-24">
      
      {/* 1. HERO SECTION (Split Grid Layout with Image & Badges) */}
      <section className="relative pt-8 sm:pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Glow Spheres Background */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-blue-600/20 to-purple-600/20 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Headline & Action Controls */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-panel border-purple-500/30 text-purple-300 text-xs font-semibold shadow-lg">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>Next-Gen Telehealth & Med AI Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Virtual Care, <br />
              <span className="gradient-text">Powered by AI</span> & Certified Doctors
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
              Get instant clinical symptom triage, consult top-rated medical specialists over HD video, and manage digital prescriptions — anytime, anywhere.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/med-ai"
                className="gradient-btn px-6 py-4 rounded-2xl font-bold text-white text-sm flex items-center space-x-2.5 shadow-xl hover:scale-105 transition-transform"
              >
                <Sparkles className="w-5 h-5 text-purple-200" />
                <span>Launch Med AI Triage</span>
              </Link>

              <a
                href="#doctors"
                className="px-6 py-4 rounded-2xl glass-panel text-slate-200 hover:text-white text-sm font-semibold hover:border-slate-600 transition-colors flex items-center space-x-2"
              >
                <Stethoscope className="w-5 h-5 text-blue-400" />
                <span>Find Doctors</span>
              </a>
            </div>

            {/* Trust Points */}
            <div className="pt-4 flex items-center space-x-6 text-xs font-semibold text-slate-400 border-t border-slate-800/80">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Verified Doctors</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Encrypted HD Video</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Med AI Triage</span>
              </span>
            </div>

          </div>

          {/* Right Column: Hero Visual Card with Overlays */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto rounded-3xl overflow-hidden glass-panel border-2 border-blue-500/30 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80"
                alt="Doctor in Telehealth Video Call"
                className="w-full h-[440px] object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Floating Overlay Badge 1: Live Consultation */}
              <div className="absolute top-4 left-4 glass-panel px-3.5 py-2 rounded-2xl flex items-center space-x-2 text-xs font-bold text-white shadow-xl backdrop-blur-md">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                <span>Live Video Telehealth</span>
              </div>

              {/* Floating Overlay Badge 2: AI Triage Badge */}
              <div className="absolute bottom-4 left-4 right-4 glass-panel p-4 rounded-2xl border-purple-500/30 flex items-center justify-between shadow-2xl backdrop-blur-md">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Med AI Assistant</h4>
                    <p className="text-[11px] text-slate-300">Instant Triage & Match</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* 2. THREE KEY PLATFORM FEATURES (Visual Grid with Images) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white">Complete Telehealth Ecosystem</h2>
          <p className="text-xs sm:text-sm text-slate-400">Everything you need for seamless online healthcare, diagnosis, and prescription management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="glass-panel rounded-3xl overflow-hidden glass-panel-hover flex flex-col justify-between">
            <div>
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80"
                  alt="AI Clinical Symptom Checker"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  AI Powered
                </span>
              </div>

              <div className="p-6 space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>Med AI Symptom Triage</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Describe symptoms to Med AI for instant clinical triage, priority level assessment, and doctor matching.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Link to="/med-ai" className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1">
                <span>Try Med AI Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel rounded-3xl overflow-hidden glass-panel-hover flex flex-col justify-between">
            <div>
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80"
                  alt="WebRTC Video Consultation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  HD Video
                </span>
              </div>

              <div className="p-6 space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Video className="w-5 h-5 text-blue-400" />
                  <span>HD Telehealth Video Rooms</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect face-to-face with certified doctors over encrypted WebRTC video streams with live chat side panel.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <a href="#doctors" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                <span>Book Video Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel rounded-3xl overflow-hidden glass-panel-hover flex flex-col justify-between">
            <div>
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80"
                  alt="Digital Prescription & Advice"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  Digital Rx
                </span>
              </div>

              <div className="p-6 space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>Instant Digital Prescriptions</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Receive official digital medical prescriptions directly from your doctor with dosage instructions and advice.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Link to="/login" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1">
                <span>View Patient Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

      </section>

      {/* 3. HOW IT WORKS WORKFLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 glass-panel rounded-3xl border-slate-800 space-y-10">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How MediConnect Works</h2>
          <p className="text-xs sm:text-sm text-slate-400">4 simple steps to receive quality medical care from anywhere.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-extrabold flex items-center justify-center text-sm">1</span>
            <h4 className="font-bold text-white text-sm">Describe Symptoms</h4>
            <p className="text-xs text-slate-400">Use Med AI to get an instant triage evaluation and doctor recommendation.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-extrabold flex items-center justify-center text-sm">2</span>
            <h4 className="font-bold text-white text-sm">Choose Specialist</h4>
            <p className="text-xs text-slate-400">Select a verified doctor based on specialty, experience, and fee.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-sm">3</span>
            <h4 className="font-bold text-white text-sm">Join Video Call</h4>
            <p className="text-xs text-slate-400">Consult live with your doctor in an encrypted HD video room.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center text-sm">4</span>
            <h4 className="font-bold text-white text-sm">Receive Digital Rx</h4>
            <p className="text-xs text-slate-400">Access your prescription and health advice directly from your dashboard.</p>
          </div>
        </div>

      </section>

      {/* 4. DOCTORS DIRECTORY SECTION */}
      <section id="doctors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Certified Medical Specialists</h2>
            <p className="text-xs sm:text-sm text-slate-400">Book online video consultation slots with verified healthcare professionals.</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center max-w-md w-full glass-panel rounded-2xl p-1.5 border-slate-700">
            <Search className="w-5 h-5 text-slate-400 ml-3" />
            <input
              type="text"
              placeholder="Search doctor name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-transparent text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white">
              Search
            </button>
          </form>
        </div>

        {/* Specialty Filter Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {specialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSpecialty === specialty
                  ? 'bg-blue-600 text-white shadow-lg border border-blue-400 scale-105'
                  : 'glass-panel text-slate-300 hover:text-white border-slate-800'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>

        {/* Doctor Grid or Skeleton */}
        {loading ? (
          <SkeletonCard count={3} />
        ) : doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                onBook={(doc) => setBookingDoctor(doc)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-panel rounded-3xl">
            <Stethoscope className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No doctors found</h3>
            <p className="text-xs text-slate-400">Try adjusting your search query or specialty filter.</p>
          </div>
        )}

      </section>

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          isOpen={!!bookingDoctor}
          onClose={() => setBookingDoctor(null)}
        />
      )}

    </div>
  );
};

export default LandingPage;
