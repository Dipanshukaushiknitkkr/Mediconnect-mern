import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import DoctorCard from '../components/DoctorCard';
import BookingModal from '../components/BookingModal';
import SkeletonCard from '../components/SkeletonCard';
import MedicalMeshCanvas from '../components/MedicalMeshCanvas';
import {
  Sparkles,
  Search,
  Stethoscope,
  Video,
  ShieldCheck,
  Activity,
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  Award,
  CalendarCheck2,
  Star,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  Brain,
  Baby,
  Bone,
  Eye,
  Building2
} from 'lucide-react';

const LandingPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const specialties = [
    { name: 'All', icon: Stethoscope, desc: 'All medical departments' },
    { name: 'Cardiology', icon: HeartPulse, desc: 'Chest pain, arrhythmias, hypertension' },
    { name: 'Dermatology', icon: Sparkles, desc: 'Skin rashes, acne, eczema, allergies' },
    { name: 'Neurology', icon: Brain, desc: 'Migraines, vertigo, nerve pain' },
    { name: 'Orthopedics', icon: Bone, desc: 'Joint pain, fractures, spine health' },
    { name: 'Pediatrics', icon: Baby, desc: 'Infant & child health, vaccinations' }
  ];

  const testimonials = [
    {
      name: 'Elena Rostova',
      location: 'Chicago, IL',
      doctor: 'Dr. Sarah Jenkins',
      specialty: 'Cardiology',
      rating: 5,
      date: 'Verified Telehealth Consultation',
      text: 'Connecting with Dr. Jenkins over HD video was seamless. She reviewed my ECG telemetry and provided precise medical advice without me having to wait hours in an ER.'
    },
    {
      name: 'Marcus Vance',
      location: 'Austin, TX',
      doctor: 'Dr. Michael Chen',
      specialty: 'Neurology',
      rating: 5,
      date: 'Verified Telehealth Consultation',
      text: 'MedAI accurately triaged my acute migraine symptoms and matched me directly with Dr. Chen. Received an official digital prescription in my portal within 20 minutes.'
    },
    {
      name: 'Priya Patel',
      location: 'New York, NY',
      doctor: 'Dr. Emily Watson',
      specialty: 'Dermatology',
      rating: 5,
      date: 'Verified Telehealth Consultation',
      text: 'The in-call clinical notes and instant Rx download are game changers. Top-tier experience for busy professionals needing high-quality medical attention.'
    }
  ];

  const faqs = [
    {
      q: 'Are MediConnect digital prescriptions legally valid at local pharmacies?',
      a: 'Yes. All prescriptions issued on MediConnect are signed by verified, licensed physicians with valid medical credentials, containing complete dosage instructions accepted at major pharmacies.'
    },
    {
      q: 'How secure is my video consultation and health data?',
      a: 'All WebRTC video rooms are end-to-end encrypted with 256-bit SSL protocols. MediConnect strictly isolates patient records and does not sell or share confidential medical telemetry.'
    },
    {
      q: 'Do I need to download external software or apps to join a video call?',
      a: 'No download is required. MediConnect runs directly in any modern web browser on desktop, tablet, or smartphone with zero plugins.'
    },
    {
      q: 'What happens if I need to reschedule or cancel my appointment?',
      a: 'You can cancel or reschedule any scheduled appointment directly from your Patient Dashboard with 1 click. Cancelled slots are instantly freed and updated in real time.'
    }
  ];

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await API.get('/doctors', {
        params: { specialty: selectedSpecialty === 'All' ? '' : selectedSpecialty, search: searchQuery }
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

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="space-y-24 pb-24">
      
      {/* 1. HERO SECTION (Split Clinical Grid with 3D Mesh Canvas) */}
      <section className="relative pt-8 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-600/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Clinical Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Accreditation Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full clinical-card border border-sky-500/20 text-sky-400 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-vital-pulse" />
              <span>Next-Gen Telehealth & Medical AI Diagnostics</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              Clinical Telemedicine, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
                Connected Seamlessly.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
              Consult board-certified medical specialists over encrypted WebRTC video, analyze clinical symptoms with MedAI, and access digital prescriptions securely.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/med-ai"
                className="clinical-btn-primary px-6 py-3.5 rounded-xl font-semibold text-white text-sm flex items-center space-x-2.5 shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-sky-200" />
                <span>Launch MedAI Triage</span>
              </Link>

              <a
                href="#doctors"
                className="px-6 py-3.5 rounded-xl clinical-card text-slate-200 hover:text-white text-sm font-semibold hover:border-sky-500/30 transition-colors flex items-center space-x-2"
              >
                <Stethoscope className="w-4 h-4 text-sky-400" />
                <span>Explore Doctors</span>
              </a>
            </div>

            {/* Clinical Trust Markers */}
            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-400 border-t border-white/5">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Physicians</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-sky-400" />
                <span>256-Bit Encrypted Video</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Digital Rx Compliant</span>
              </span>
            </div>

          </div>

          {/* Right Column: 3D Interactive Telehealth Visual Studio */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto rounded-2xl overflow-hidden clinical-card border border-sky-500/20 shadow-2xl p-6 min-h-[420px] flex flex-col justify-between">
              
              {/* 3D Telemetry Canvas Background */}
              <MedicalMeshCanvas className="rounded-2xl" />

              {/* Top Live Video Consultation Pill */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="clinical-card px-3 py-1.5 rounded-xl flex items-center space-x-2 text-xs font-semibold text-white border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-vital-pulse" />
                  <span>Teleconsultation Suite</span>
                </div>
                <span className="text-[11px] font-bold text-sky-400 tracking-wider uppercase">HD 1080p</span>
              </div>

              {/* Center Interactive Telehealth Preview */}
              <div className="relative z-10 my-8 p-4 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Live Patient Vitals Monitor</h4>
                    <p className="text-[11px] text-slate-400">Continuous telemetry sync during call</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-medium">Heart Rate</span>
                    <span className="text-xs font-bold text-emerald-400 tabular-nums">72 BPM</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-medium">SpO2</span>
                    <span className="text-xs font-bold text-sky-400 tabular-nums">99%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-medium">Latency</span>
                    <span className="text-xs font-bold text-amber-400 tabular-nums">18 ms</span>
                  </div>
                </div>
              </div>

              {/* Bottom MedAI Smart Status Bar */}
              <div className="relative z-10 clinical-card p-3 rounded-xl border border-sky-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold text-slate-200">AI Diagnostic Companion</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Ready
                </span>
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* 2. LIVE CLINICAL IMPACT & TELEMETRY STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="clinical-card rounded-2xl p-6 border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">12,500+</div>
            <p className="text-xs text-slate-400 font-medium">Consultations Completed</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-sky-400 tabular-nums">&lt; 3 Min</div>
            <p className="text-xs text-slate-400 font-medium">Avg. Connection Time</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">99.4%</div>
            <p className="text-xs text-slate-400 font-medium">Patient Satisfaction</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 tabular-nums">100%</div>
            <p className="text-xs text-slate-400 font-medium">Board-Certified Specialists</p>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE SPECIALTY SYMPTOM TRIAGE BENTO GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Specialized Clinical Care</h2>
            <p className="text-xs sm:text-sm text-slate-400">Select your medical concern to filter verified physicians by clinical department.</p>
          </div>
          <Link to="/med-ai" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1">
            <span>Not sure? Run MedAI triage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialties.map((s) => {
            const Icon = s.icon;
            const isSelected = selectedSpecialty === s.name;

            return (
              <button
                key={s.name}
                onClick={() => {
                  setSelectedSpecialty(s.name);
                  const docSection = document.getElementById('doctors');
                  if (docSection) docSection.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-left p-5 rounded-2xl clinical-card clinical-card-interactive border transition-all ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500/10 shadow-lg'
                    : 'border-white/5 hover:border-sky-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-sky-500 text-white' : 'bg-slate-900 text-sky-400 border border-white/5'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Active Filter
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white mb-1">{s.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. THREE CORE CLINICAL PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Comprehensive Virtual Care Infrastructure</h2>
          <p className="text-xs sm:text-sm text-slate-400">Streamlined telehealth designed for clinical accuracy, speed, and patient convenience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1: MedAI */}
          <div className="clinical-card clinical-card-interactive rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">MedAI Clinical Triage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Describe patient symptoms or upload medical lab reports for rapid clinical triage, severity classification, and targeted specialist recommendation.
              </p>
            </div>

            <Link to="/med-ai" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1.5 pt-2">
              <span>Launch AI Diagnostic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 2: WebRTC Video */}
          <div className="clinical-card clinical-card-interactive rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-teal-400">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Ultra-Low Latency Video Rooms</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Encrypted peer-to-peer WebRTC consultation rooms with high-definition audio/video, clinical in-call notes, and live chat messaging.
              </p>
            </div>

            <a href="#doctors" className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center space-x-1.5 pt-2">
              <span>Find a Specialist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Pillar 3: Digital Prescriptions */}
          <div className="clinical-card clinical-card-interactive rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Digital Prescription Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Legitimate digital prescriptions generated directly by attending physicians with exact dosage schedules, dietary directions, and advice.
              </p>
            </div>

            <Link to="/login" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1.5 pt-2">
              <span>Access Patient Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </section>

      {/* 5. DOCTORS DIRECTORY SECTION */}
      <section id="doctors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Accredited Physician Roster</h2>
            <p className="text-xs sm:text-sm text-slate-400">Schedule high-definition telehealth consultations with verified healthcare doctors.</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center max-w-md w-full clinical-card rounded-xl p-1.5 border border-white/10">
            <Search className="w-4 h-4 text-slate-400 ml-2.5" />
            <input
              type="text"
              placeholder="Search doctor name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 bg-transparent text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none"
            />
            <button type="submit" className="px-3.5 py-1.5 clinical-btn-primary rounded-lg text-xs font-semibold">
              Search
            </button>
          </form>
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
          <div className="text-center py-12 clinical-card rounded-2xl border border-white/5">
            <Stethoscope className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">No Physicians Found</h3>
            <p className="text-xs text-slate-400">Try adjusting your search query or selecting a different specialty filter.</p>
          </div>
        )}

      </section>

      {/* 6. VERIFIED PATIENT CLINICAL TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Verified Patient Consultations</h2>
          <p className="text-xs sm:text-sm text-slate-400">Real clinical outcomes and feedback from patients across the network.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="clinical-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{t.text}"</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{t.name}</h4>
                  <p className="text-[11px] text-slate-400">{t.location}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 block">
                    {t.specialty}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CLINICAL FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-slate-400">Everything you need to know about MediConnect telehealth protocols.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;

            return (
              <div key={idx} className="clinical-card rounded-xl border border-white/5 overflow-hidden transition-colors">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:text-sky-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-sky-400 shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
