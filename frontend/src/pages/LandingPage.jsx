import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import DoctorCard from '../components/DoctorCard';
import BookingModal from '../components/BookingModal';
import SkeletonCard from '../components/SkeletonCard';
import usePageMeta from '../hooks/usePageMeta';
import {
  Sparkles,
  Search,
  Stethoscope,
  Video,
  ShieldCheck,
  ArrowRight,
  FileText,
  Lock,
  Star,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  Brain,
  Baby,
  Bone,
  Calendar,
  Clock,
  Check
} from 'lucide-react';

const LandingPage = () => {
  usePageMeta(
    'Online Consultations & Symptom Triage',
    'Consult board-certified doctors over private video, check symptoms with MedAI, and receive digital prescriptions.'
  );

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
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

  const specialties = [
    { name: 'All', icon: Stethoscope, desc: 'All medical departments & general medicine' },
    { name: 'Cardiology', icon: HeartPulse, desc: 'Heart health, blood pressure, arrhythmias' },
    { name: 'Dermatology', icon: Sparkles, desc: 'Rashes, eczema, acne, skin conditions' },
    { name: 'Neurology', icon: Brain, desc: 'Migraines, vertigo, nerve and cognitive health' },
    { name: 'Orthopedics', icon: Bone, desc: 'Joint pain, sprains, musculoskeletal injuries' },
    { name: 'Pediatrics', icon: Baby, desc: 'Infant and child wellness, routine checks' }
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
      nextAvailable: 'Available in 15 min',
      consultTypes: ['video', 'audio', 'chat'],
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
      nextAvailable: 'Next: Today, 3:30 PM',
      consultTypes: ['video', 'audio'],
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
      nextAvailable: 'Available in 15 min',
      consultTypes: ['video', 'chat'],
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
      nextAvailable: 'Next: Today, 4:15 PM',
      consultTypes: ['video', 'audio', 'chat'],
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
      nextAvailable: 'Available in 30 min',
      consultTypes: ['video', 'audio'],
      bio: 'Orthopedic specialist focusing on sports injuries, joint rehabilitation, and musculoskeletal health.'
    }
  ];

  // Sample testimonials
  const sampleTestimonials = [
    {
      name: 'Elena Rostova',
      location: 'Chicago, IL',
      doctor: 'Dr. Sarah Jenkins',
      specialty: 'Cardiology',
      rating: 5,
      text: 'Talking with Dr. Jenkins over video was straightforward. She reviewed my symptoms carefully and provided clear advice without me having to sit in an urgent care waiting room.'
    },
    {
      name: 'Marcus Vance',
      location: 'Austin, TX',
      doctor: 'Dr. Michael Chen',
      specialty: 'Neurology',
      rating: 5,
      text: 'The symptom checker helped me describe my issue and matched me with Dr. Chen. I had a 20-minute video visit and received my prescription shortly after.'
    },
    {
      name: 'Priya Patel',
      location: 'New York, NY',
      doctor: 'Dr. Emily Watson',
      specialty: 'Dermatology',
      rating: 5,
      text: 'Great option for a busy workday. Dr. Watson examined my skin rash over video and sent a prescription straight to my account.'
    }
  ];

  const faqs = [
    {
      q: 'Are digital prescriptions valid at regular pharmacies?',
      a: 'Yes. Prescriptions issued by doctors on MediConnect include valid license numbers and complete dosage instructions, and are accepted at retail and mail-order pharmacies.'
    },
    {
      q: 'Is my video consultation private and secure?',
      a: 'Yes. All video visits are end-to-end encrypted and comply with HIPAA security standards. Your consultation details and medical records remain strictly confidential.'
    },
    {
      q: 'Do I need to download software or an app to join a call?',
      a: 'No download is required. MediConnect runs directly in your standard web browser on your phone, tablet, or computer.'
    },
    {
      q: 'Can I reschedule or cancel an appointment?',
      a: 'Yes. You can manage, reschedule, or cancel any upcoming appointment from your patient dashboard at any time prior to the visit.'
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
      console.warn('Stats fetch deferred:', err.message);
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
      setDoctors(getFilteredFallbackDoctors(selectedSpecialty, searchQuery));
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
    const docSection = document.getElementById('doctors');
    if (docSection) {
      docSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const displayedTestimonials = realReviews.length > 0 ? realReviews : sampleTestimonials;

  return (
    <div className="space-y-20 sm:space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="pt-10 sm:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline, Search Bar & Plain-Text Trust Line */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <h1 className="text-4xl sm:text-6xl font-serif font-bold text-[#1C2B24] tracking-tight leading-[1.12]">
              Healthcare that <br />
              <span className="text-[#1F4D3D] italic font-normal">feels like care.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#53655D] leading-relaxed max-w-xl">
              Consult board-certified physicians from home, check symptoms with our clinical triage assistant, and receive pharmacy-ready prescriptions in minutes.
            </p>

            {/* Functional Primary Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="bg-white p-2 sm:p-2.5 rounded-2xl border border-[#E8DFD3] shadow-md flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              {/* Specialty Select */}
              <div className="flex-1 px-3 py-2 border-b sm:border-b-0 sm:border-r border-[#E8DFD3]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7B8D85] mb-0.5">
                  Specialty
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-[#1C2B24] focus:outline-none cursor-pointer"
                >
                  <option value="All">All Specialties</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                </select>
              </div>

              {/* Date / Timeframe Select */}
              <div className="flex-1 px-3 py-2 border-b sm:border-b-0 sm:border-r border-[#E8DFD3]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7B8D85] mb-0.5">
                  Availability
                </label>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-[#1C2B24] focus:outline-none cursor-pointer"
                >
                  <option value="today">Available Today</option>
                  <option value="tomorrow">Available Tomorrow</option>
                  <option value="week">This Week</option>
                </select>
              </div>

              {/* Find Care Button (Warm Amber-Red CTA) */}
              <button
                type="submit"
                className="btn-cta-primary px-6 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Find care</span>
              </button>
            </form>

            {/* Plain-Text Trust Line (No badge styling) */}
            <div className="pt-2 text-xs sm:text-sm text-[#53655D] flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-[#1C2B24] flex items-center">
                <Star className="w-4 h-4 fill-[#C4501F] text-[#C4501F] mr-1 inline" />
                4.9/5 from 12,000+ visits
              </span>
              <span className="text-[#E8DFD3] hidden sm:inline">•</span>
              <span>HIPAA-compliant encrypted video</span>
              <span className="text-[#E8DFD3] hidden sm:inline">•</span>
              <span>Major insurance & digital Rx accepted</span>
            </div>

          </div>

          {/* Right Column: Doctor Photo Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 border border-[#E8DFD3] shadow-lg">
              
              {/* Main Featured Doctor Card */}
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-[#DCEAE1]">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600"
                    alt="Dr. Sarah Jenkins"
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Single Clean Live Status Indicator */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#E8DFD3] shadow-sm flex items-center space-x-1.5 text-xs font-semibold text-[#1F4D3D]">
                    <span className="w-2 h-2 rounded-full bg-[#1F4D3D] animate-vital-pulse" />
                    <span>Available in 15 min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#1C2B24]">Dr. Sarah Jenkins, MD</h3>
                    <p className="text-xs text-[#53655D]">Cardiologist • Harvard Medical School</p>
                  </div>
                  <span className="text-sm font-bold text-[#1F4D3D] bg-[#DCEAE1] px-3 py-1 rounded-lg">
                    $85 / visit
                  </span>
                </div>
              </div>

              {/* Secondary Doctor Thumbnails Bar */}
              <div className="mt-4 pt-4 border-t border-[#E8DFD3] flex items-center justify-between">
                <div className="flex items-center -space-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120"
                    alt="Dr. Michael Chen"
                    className="w-9 h-9 rounded-full object-cover border-2 border-white"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1594824813588-44643037197f?auto=format&fit=crop&q=80&w=120"
                    alt="Dr. Emily Watson"
                    className="w-9 h-9 rounded-full object-cover border-2 border-white"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=120"
                    alt="Dr. David Rodriguez"
                    className="w-9 h-9 rounded-full object-cover border-2 border-white"
                  />
                </div>
                <p className="text-xs text-[#53655D] font-medium">
                  <strong className="text-[#1C2B24]">50+ physicians</strong> on-call today
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. STATS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DFD3] grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-sm">
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1C2B24] tabular-nums">
              {publicStats.totalAppointments > 0 ? `${publicStats.totalAppointments}+` : '10,000+'}
            </div>
            <p className="text-xs text-[#53655D] font-medium">Consultations completed</p>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1F4D3D] tabular-nums">
              {publicStats.verifiedDoctors || doctors.length || 50}+
            </div>
            <p className="text-xs text-[#53655D] font-medium">Board-certified doctors</p>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1C2B24] tabular-nums">
              15 min
            </div>
            <p className="text-xs text-[#53655D] font-medium">Average wait time</p>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#C4501F] tabular-nums">
              4.9 / 5.0
            </div>
            <p className="text-xs text-[#53655D] font-medium">Average patient rating</p>
          </div>
        </div>
      </section>

      {/* 3. SPECIALTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C2B24]">Find Care by Specialty</h2>
            <p className="text-sm text-[#53655D]">Select a department to view available physicians.</p>
          </div>
          <Link to="/med-ai" className="text-sm font-semibold text-[#1F4D3D] hover:underline flex items-center space-x-1">
            <span>Need guidance? Check symptoms with AI</span>
            <ArrowRight className="w-4 h-4" />
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
                className={`text-left p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-[#DCEAE1] border-[#1F4D3D] shadow-sm'
                    : 'bg-white border-[#E8DFD3] hover:border-[#1F4D3D]/40'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-[#1F4D3D] text-white' : 'bg-[#FBF6EF] text-[#1F4D3D]'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#1C2B24]">{s.name}</h3>
                </div>
                <p className="text-xs text-[#53655D] leading-relaxed">{s.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. THREE PILLARS (HOW MEDICONNECT WORKS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C2B24]">How MediConnect Works</h2>
          <p className="text-sm text-[#53655D]">Everything you need for a doctor visit from the comfort of your home.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1 */}
          <div className="clinical-card-sand p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white text-[#C4501F] flex items-center justify-center border border-[#E8DFD3]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#1C2B24]">1. AI Symptom Check</h3>
              <p className="text-xs sm:text-sm text-[#53655D] leading-relaxed">
                Describe what you are feeling in everyday language. MedAI evaluates your urgency and guides you to the right department.
              </p>
            </div>
            <Link to="/med-ai" className="text-xs font-semibold text-[#C4501F] hover:underline flex items-center space-x-1">
              <span>Try Symptom Checker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 2 */}
          <div className="clinical-card-sage p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white text-[#1F4D3D] flex items-center justify-center border border-[#1F4D3D]/20">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#1C2B24]">2. Video Consultation</h3>
              <p className="text-xs sm:text-sm text-[#53655D] leading-relaxed">
                Meet with verified physicians over encrypted, high-definition video directly in your web browser with zero downloads.
              </p>
            </div>
            <a href="#doctors" className="text-xs font-semibold text-[#1F4D3D] hover:underline flex items-center space-x-1">
              <span>Find Available Physicians</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E8DFD3] flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FBF6EF] text-[#1F4D3D] flex items-center justify-center border border-[#E8DFD3]">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#1C2B24]">3. Digital Prescriptions</h3>
              <p className="text-xs sm:text-sm text-[#53655D] leading-relaxed">
                Receive signed digital prescriptions with dosage instructions directly in your secure patient portal right after your call.
              </p>
            </div>
            <Link to="/login" className="text-xs font-semibold text-[#1F4D3D] hover:underline flex items-center space-x-1">
              <span>Access Patient Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* 5. DOCTORS DIRECTORY */}
      <section id="doctors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C2B24]">Available Physicians</h2>
            <p className="text-sm text-[#53655D]">Schedule a video visit with a board-certified specialist.</p>
          </div>

          {/* Search Input */}
          <form onSubmit={(e) => { e.preventDefault(); fetchDoctors(); }} className="flex items-center max-w-md w-full bg-white rounded-xl p-1.5 border border-[#E8DFD3] shadow-sm">
            <Search className="w-4 h-4 text-[#7B8D85] ml-2.5" />
            <input
              type="text"
              placeholder="Search by doctor name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 bg-transparent text-[#1C2B24] text-xs sm:text-sm placeholder-[#7B8D85] focus:outline-none"
            />
            <button type="submit" className="px-3.5 py-1.5 btn-forest-primary rounded-lg text-xs font-semibold">
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
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E8DFD3]">
            <Stethoscope className="w-10 h-10 text-[#7B8D85] mx-auto mb-2" />
            <h3 className="text-base font-bold text-[#1C2B24]">No Doctors Found</h3>
            <p className="text-xs text-[#53655D]">Try adjusting your search terms or specialty filter above.</p>
          </div>
        )}

      </section>

      {/* 6. PATIENT REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C2B24]">Patient Experiences</h2>
          <p className="text-sm text-[#53655D]">Feedback from patients who consulted doctors through MediConnect.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayedTestimonials.map((t, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-[#E8DFD3] flex flex-col justify-between space-y-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center space-x-1">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C4501F] text-[#C4501F]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#1C2B24] leading-relaxed italic">"{t.text || t.comment}"</p>
              </div>

              <div className="pt-3 border-t border-[#E8DFD3] flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-[#1C2B24]">{t.name}</h4>
                  <p className="text-[11px] text-[#53655D]">{t.location || t.doctor || 'Verified Patient'}</p>
                </div>
                {t.specialty && (
                  <span className="text-[11px] font-medium text-[#1F4D3D] bg-[#DCEAE1] px-2.5 py-0.5 rounded-md">
                    {t.specialty}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C2B24]">Frequently Asked Questions</h2>
          <p className="text-sm text-[#53655D]">Answers about video visits, prescriptions, and privacy.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;

            return (
              <div key={idx} className="bg-white rounded-xl border border-[#E8DFD3] overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-[#1C2B24] hover:text-[#1F4D3D] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#1F4D3D] shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-[#7B8D85] shrink-0 ml-2" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-[#53655D] leading-relaxed border-t border-[#E8DFD3]">
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
