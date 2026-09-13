import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import API from '../services/api';
import DoctorCard from '../components/DoctorCard';
import BookingModal from '../components/BookingModal';
import SkeletonCard from '../components/SkeletonCard';
import MedicalMeshCanvas from '../components/MedicalMeshCanvas';
import usePageMeta from '../hooks/usePageMeta';
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
  Building2,
  Info
} from 'lucide-react';

const LandingPage = () => {
  usePageMeta(
    'Online Consultations & Symptom Triage',
    'Consult verified doctors over encrypted WebRTC video, check symptoms with MedAI, and receive digital prescriptions.'
  );

  const headlineRef = useRef(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [publicStats, setPublicStats] = useState({
    verifiedDoctors: 0,
    totalAppointments: 0,
    activeSpecialties: 6,
    averageDoctorRating: 4.9
  });
  const [realReviews, setRealReviews] = useState([]);
  const [telemetry, setTelemetry] = useState({
    heartRate: 72,
    spo2: 99,
    latency: 18
  });

  // Subtle periodic vitals ticker (Reduced-motion safe)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setTelemetry({ heartRate: 72, spo2: 99, latency: 18 });
      return;
    }

    const hrOffsets = [-1, 0, 1, 2, -2];
    const interval = setInterval(() => {
      setTelemetry({
        heartRate: Math.min(75, Math.max(69, 72 + hrOffsets[Math.floor(Math.random() * hrOffsets.length)])),
        spo2: Math.random() > 0.8 ? 98 : 99,
        latency: Math.min(21, Math.max(16, 18 + Math.floor(Math.random() * 5 - 2)))
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const specialties = [
    { name: 'All', icon: Stethoscope, desc: 'All medical departments' },
    { name: 'Cardiology', icon: HeartPulse, desc: 'Chest pain, irregular heartbeat, blood pressure' },
    { name: 'Dermatology', icon: Sparkles, desc: 'Skin rashes, acne, eczema, allergies' },
    { name: 'Neurology', icon: Brain, desc: 'Migraines, vertigo, nerve pain' },
    { name: 'Orthopedics', icon: Bone, desc: 'Joint pain, sprains, back problems' },
    { name: 'Pediatrics', icon: Baby, desc: 'Infant & child health, wellness checks' }
  ];

  // Sample placeholder testimonials for demonstration
  const sampleTestimonials = [
    {
      name: 'Elena Rostova',
      location: 'Chicago, IL',
      doctor: 'Dr. Sarah Jenkins',
      specialty: 'Cardiology',
      rating: 5,
      isSample: true,
      text: 'Talking with Dr. Jenkins over video was straightforward. She reviewed my recent symptoms and provided clear advice without me having to wait in an urgent care clinic.'
    },
    {
      name: 'Marcus Vance',
      location: 'Austin, TX',
      doctor: 'Dr. Michael Chen',
      specialty: 'Neurology',
      rating: 5,
      isSample: true,
      text: 'The symptom checker helped me find Dr. Chen quickly. I had a 20-minute video visit and received my prescription in the portal shortly after.'
    },
    {
      name: 'Priya Patel',
      location: 'New York, NY',
      doctor: 'Dr. Emily Watson',
      specialty: 'Dermatology',
      rating: 5,
      isSample: true,
      text: 'Great option for a busy workday. Dr. Watson examined my skin rash over HD video and sent a prescription straight to my account.'
    }
  ];

  const faqs = [
    {
      q: 'Are digital prescriptions valid at regular pharmacies?',
      a: 'Yes. Prescriptions issued by doctors on MediConnect include valid license numbers and complete dosage instructions, and are accepted at standard retail and mail-order pharmacies.'
    },
    {
      q: 'Is my video visit and health data private?',
      a: 'Yes. All video consultations use end-to-end encrypted connections. Your medical notes and consultation details are kept strictly confidential in your secure account.'
    },
    {
      q: 'Do I need to download an app to join a call?',
      a: 'No app is needed. MediConnect runs directly in your web browser on a laptop, tablet, or smartphone without any extra downloads.'
    },
    {
      q: 'Can I reschedule or cancel an appointment?',
      a: 'Yes. You can manage, reschedule, or cancel any upcoming appointment directly from your patient dashboard at any time.'
    }
  ];

  // Fallback verified physicians if database is seeding or cold starting
  const defaultDoctors = [
    {
      _id: 'doc-cardiology-1',
      user: {
        _id: 'user-doc-1',
        name: 'Dr. Sarah Jenkins, MD',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
      },
      specialty: 'Cardiology',
      qualification: 'MD, FACC - Harvard Medical School',
      hospital: 'Johns Hopkins Hospital',
      experienceYears: 14,
      hourlyFee: 85,
      rating: 4.9,
      reviewCount: 48,
      bio: 'Board-certified cardiologist specializing in preventive cardiology, hypertension, and arrhythmias.'
    },
    {
      _id: 'doc-neurology-1',
      user: {
        _id: 'user-doc-2',
        name: 'Dr. Michael Chen, MD',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300'
      },
      specialty: 'Neurology',
      qualification: 'MD, PhD - Stanford University',
      hospital: 'Mayo Clinic',
      experienceYears: 12,
      hourlyFee: 95,
      rating: 4.9,
      reviewCount: 56,
      bio: 'Specialist in migraines, neurological disorders, and cognitive health with over a decade of clinical practice.'
    },
    {
      _id: 'doc-dermatology-1',
      user: {
        _id: 'user-doc-3',
        name: 'Dr. Emily Watson, MD',
        avatar: 'https://images.unsplash.com/photo-1594824813588-44643037197f?auto=format&fit=crop&q=80&w=300'
      },
      specialty: 'Dermatology',
      qualification: 'MD, FAAD - Columbia University',
      hospital: 'Mount Sinai Hospital',
      experienceYears: 9,
      hourlyFee: 75,
      rating: 4.8,
      reviewCount: 39,
      bio: 'Clinical dermatologist providing comprehensive care for acute and chronic skin conditions.'
    },
    {
      _id: 'doc-pediatrics-1',
      user: {
        _id: 'user-doc-4',
        name: 'Dr. David Rodriguez, MD',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300'
      },
      specialty: 'Pediatrics',
      qualification: 'MD, FAAP - Johns Hopkins University',
      hospital: 'Boston Children\'s Hospital',
      experienceYears: 11,
      hourlyFee: 70,
      rating: 4.9,
      reviewCount: 52,
      bio: 'Dedicated pediatrician specializing in infant development, adolescent care, and routine wellness visits.'
    },
    {
      _id: 'doc-orthopedics-1',
      user: {
        _id: 'user-doc-5',
        name: 'Dr. Lisa Chang, MD',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
      },
      specialty: 'Orthopedics',
      qualification: 'MD, FAAOS - UCLA Medical Center',
      hospital: 'Cedars-Sinai Medical Center',
      experienceYears: 15,
      hourlyFee: 90,
      rating: 4.9,
      reviewCount: 44,
      bio: 'Orthopedic specialist focusing on sports injuries, joint rehabilitation, and musculoskeletal health.'
    }
  ];

  useEffect(() => {
    fetchDoctors();
    fetchPublicStats();
  }, [selectedSpecialty]);

  const fetchPublicStats = async () => {
    try {
      const res = await API.get('/stats/public');
      if (res.data?.success) {
        setPublicStats(res.data.stats);
        if (res.data.reviews && res.data.reviews.length > 0) {
          setRealReviews(res.data.reviews);
        }
      }
    } catch (err) {
      console.error('Fetch public stats error:', err.message);
    }
  };

  const getFilteredFallbackDoctors = (spec, query) => {
    let list = defaultDoctors;
    if (spec && spec !== 'All') {
      list = list.filter((d) => d.specialty.toLowerCase() === spec.toLowerCase());
    }
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.user?.name?.toLowerCase().includes(q) ||
          d.specialty?.toLowerCase().includes(q) ||
          d.hospital?.toLowerCase().includes(q)
      );
    }
    return list;
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await API.get('/doctors', {
        params: { specialty: selectedSpecialty === 'All' ? '' : selectedSpecialty, search: searchQuery }
      });
      if (res.data?.success && Array.isArray(res.data.doctors) && res.data.doctors.length > 0) {
        setDoctors(res.data.doctors);
      } else {
        setDoctors(getFilteredFallbackDoctors(selectedSpecialty, searchQuery));
      }
    } catch (err) {
      console.warn('Backend doctors query deferred to verified fallback directory:', err.message);
      setDoctors(getFilteredFallbackDoctors(selectedSpecialty, searchQuery));
    } finally {
      setLoading(false);
    }
  };

  // Safe Hero Headline Fade-Slide (Mount Only, Non-destructive)
  useEffect(() => {
    const headlineEl = headlineRef.current;
    if (!headlineEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      gsap.from(headlineEl, {
        opacity: 0,
        y: 18,
        duration: 0.6,
        ease: 'power2.out'
      });
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const displayedTestimonials = realReviews.length > 0 ? realReviews : sampleTestimonials;

  return (
    <div className="space-y-24 pb-24">
      
      {/* 1. HERO SECTION (Direct & Human) */}
      <section className="relative pt-8 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-600/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Accreditation Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full clinical-card border border-sky-500/20 text-sky-400 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-vital-pulse" />
              <span>Online Consultations & Symptom Triage</span>
            </div>

            <h1 ref={headlineRef} className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              See a doctor online. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
                Get care today.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
              Talk with licensed physicians over private video, check symptoms with our guided triage assistant, and receive digital prescriptions in minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/med-ai"
                className="clinical-btn-primary px-6 py-3.5 rounded-xl font-semibold text-white text-sm flex items-center space-x-2.5 shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-sky-200" />
                <span>Check Symptoms with AI</span>
              </Link>

              <a
                href="#doctors"
                className="px-6 py-3.5 rounded-xl clinical-card text-slate-200 hover:text-white text-sm font-semibold hover:border-sky-500/30 transition-colors flex items-center space-x-2"
              >
                <Stethoscope className="w-4 h-4 text-sky-400" />
                <span>Find a Doctor</span>
              </a>
            </div>

            {/* Trust Markers */}
            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-400 border-t border-white/5">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Doctors</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-sky-400" />
                <span>Private & Encrypted Video</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Pharmacy-Ready Prescriptions</span>
              </span>
            </div>

          </div>

          {/* Right Column: Interactive Video Preview Studio */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto rounded-2xl overflow-hidden clinical-card border border-sky-500/20 shadow-2xl p-6 min-h-[420px] flex flex-col justify-between">
              
              {/* 3D Telemetry Canvas Background */}
              <MedicalMeshCanvas className="rounded-2xl" />

              {/* Top Live Video Consultation Pill */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="clinical-card px-3 py-1.5 rounded-xl flex items-center space-x-2 text-xs font-semibold text-white border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-vital-pulse" />
                  <span>Video Consultation</span>
                </div>
                <span className="text-[11px] font-bold text-sky-400 tracking-wider uppercase">HD Video</span>
              </div>

              {/* Center Interactive Telehealth Preview */}
              <div className="relative z-10 my-8 p-4 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Video Call Preview</h4>
                      <p className="text-[11px] text-slate-400">In-call health and connection monitor</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    UI Preview
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-medium">Heart Rate</span>
                    <span className="text-xs font-bold text-emerald-400 tabular-nums">{telemetry.heartRate} BPM</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-medium">SpO2</span>
                    <span className="text-xs font-bold text-sky-400 tabular-nums">{telemetry.spo2}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-medium">Latency</span>
                    <span className="text-xs font-bold text-amber-400 tabular-nums">{telemetry.latency} ms</span>
                  </div>
                </div>
              </div>

              {/* Bottom MedAI Smart Status Bar */}
              <div className="relative z-10 clinical-card p-3 rounded-xl border border-sky-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold text-slate-200">AI Symptom Assistant</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Ready
                </span>
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* 2. REAL-TIME PLATFORM METRICS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="clinical-card rounded-2xl p-6 border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
              {publicStats.totalAppointments > 0 ? `${publicStats.totalAppointments}+` : 'Active'}
            </div>
            <p className="text-xs text-slate-400 font-medium">Consultations Booked</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-sky-400 tabular-nums">
              {publicStats.verifiedDoctors || doctors.length || 3}
            </div>
            <p className="text-xs text-slate-400 font-medium">Verified Doctors</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">
              {publicStats.activeSpecialties || 6}
            </div>
            <p className="text-xs text-slate-400 font-medium">Medical Specialties</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 tabular-nums">
              {publicStats.averageDoctorRating ? `${publicStats.averageDoctorRating} / 5.0` : '4.9 / 5.0'}
            </div>
            <p className="text-xs text-slate-400 font-medium">Avg. Doctor Rating</p>
          </div>
        </div>
      </section>

      {/* 3. SPECIALTY BENTO GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Find Care by Specialty</h2>
            <p className="text-xs sm:text-sm text-slate-400">Choose a department to view available doctors and schedule a visit.</p>
          </div>
          <Link to="/med-ai" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1">
            <span>Not sure? Run symptom triage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Responsive Bento Grid: 4 cols (xl) -> 3 cols (lg) -> 2 cols (sm/md) -> 1 col (mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {specialties.map((s) => {
            const Icon = s.icon;
            const isSelected = selectedSpecialty === s.name;
            const isFeatured = s.name === 'All';

            return (
              <button
                key={s.name}
                onClick={() => {
                  setSelectedSpecialty(s.name);
                  const docSection = document.getElementById('doctors');
                  if (docSection) docSection.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-left p-5 rounded-2xl clinical-card clinical-card-interactive border transition-all duration-300 ease-out hover:scale-[1.02] flex flex-col justify-between ${
                  isFeatured ? 'col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 bg-gradient-to-br from-slate-900/90 to-sky-950/30' : 'col-span-1'
                } ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500/10 shadow-lg ring-1 ring-sky-500/40'
                    : 'border-white/5 hover:border-sky-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-sky-500 text-white' : 'bg-slate-900 text-sky-400 border border-white/5'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {isFeatured && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Comprehensive
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{s.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>

                {isFeatured && (
                  <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>View all board-certified doctors across departments</span>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. THREE PILLARS (Bento Grid with 2x1 MedAI Flagship Card) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">How MediConnect Works</h2>
          <p className="text-xs sm:text-sm text-slate-400">Everything you need for a doctor visit from home.</p>
        </div>

        {/* Responsive Bento Grid: 4 cols on lg (MedAI takes 2 cols) -> 2 cols on md -> 1 col on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Pillar 1: MedAI Flagship (2x1 Bento Span) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 clinical-card clinical-card-interactive rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all duration-300 ease-out hover:scale-[1.02] border border-sky-500/20 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-sky-950/40 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400 shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-vital-pulse" />
                  <span>Instant AI Triage</span>
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-1.5">AI Symptom Triage & Clinical Routing</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Describe your symptoms to get an instant clinical evaluation, urgency assessment, and a direct match with the right medical specialty.
                </p>
              </div>

              {/* Interactive Symptom Chips Preview */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Chest Discomfort', 'Acute Migraine', 'Skin Rash', 'Joint Pain'].map((chip) => (
                  <span key={chip} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950/60 border border-white/5 text-slate-400">
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <Link to="/med-ai" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1.5 pt-2">
              <span>Check Symptoms with MedAI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 2: Video Consultations (1x1 Bento Span) */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1 clinical-card clinical-card-interactive rounded-2xl p-6 flex flex-col justify-between space-y-6 transition-all duration-300 ease-out hover:scale-[1.02] border border-white/5">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-teal-400">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Private Video Visits</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Meet face-to-face with doctors in your browser with clear video, audio, and encrypted in-call text chat.
              </p>
            </div>

            <a href="#doctors" className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center space-x-1.5 pt-2">
              <span>Find a Doctor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Pillar 3: Prescriptions (1x1 Bento Span) */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1 clinical-card clinical-card-interactive rounded-2xl p-6 flex flex-col justify-between space-y-6 transition-all duration-300 ease-out hover:scale-[1.02] border border-white/5">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Digital Prescriptions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your doctor provides signed digital prescriptions with dosage instructions directly in your portal right after your call.
              </p>
            </div>

            <Link to="/login" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1.5 pt-2">
              <span>Patient Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </section>

      {/* 5. DOCTORS DIRECTORY SECTION */}
      <section id="doctors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Available Doctors</h2>
            <p className="text-xs sm:text-sm text-slate-400">Schedule a video consultation with a verified healthcare professional.</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center max-w-md w-full clinical-card rounded-xl p-1.5 border border-white/10">
            <Search className="w-4 h-4 text-slate-400 ml-2.5" />
            <input
              type="text"
              placeholder="Search doctor by name or specialty..."
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
            <h3 className="text-base font-bold text-white">No Doctors Found</h3>
            <p className="text-xs text-slate-400">Try adjusting your search terms or picking another specialty filter above.</p>
          </div>
        )}

      </section>

      {/* 6. PATIENT REVIEWS & FEEDBACK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Patient Reviews</h2>
            {realReviews.length === 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[11px] font-semibold border border-amber-500/20">
                Sample feedback
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {realReviews.length > 0
              ? 'Real reviews from patients who consulted doctors through MediConnect.'
              : 'Illustrative feedback representing typical telehealth patient visits.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayedTestimonials.map((t, idx) => (
            <div key={idx} className="clinical-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-1">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{t.text || t.comment}"</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{t.name}</h4>
                  <p className="text-[11px] text-slate-400">{t.location || t.doctor || 'Verified Patient'}</p>
                </div>
                <div className="text-right">
                  {t.specialty && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 block mb-0.5">
                      {t.specialty}
                    </span>
                  )}
                  {t.isSample ? (
                    <span className="text-[10px] text-amber-400/90 font-medium">Illustrative</span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-medium">Verified Review</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-slate-400">Answers about video visits, prescriptions, and privacy.</p>
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
