import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Video,
  FileText,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Lock,
  CheckCircle2,
  Clock,
  Laptop
} from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const HowItWorksPage = () => {
  usePageMeta(
    'How MediConnect Works',
    'Explore our 4-step virtual healthcare process: AI symptom triage, doctor booking, private video visits, and digital prescriptions.'
  );
  const steps = [
    {
      num: '01',
      title: 'Describe Your Symptoms',
      subtitle: 'AI-Guided Initial Assessment',
      icon: Sparkles,
      color: 'from-sky-500/20 to-sky-600/10 text-sky-400 border-sky-500/30',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      description:
        'Tell our MedAI assistant how you are feeling. The system evaluates urgency (Emergency, High, Moderate, Low), flags potential issues, and recommends the appropriate medical specialty.',
      bullets: [
        'Instant clinical severity triage',
        'Emergency symptom warnings & ER guidance',
        'Tailored specialist department recommendation'
      ],
      ctaText: 'Test Symptom Triage',
      ctaLink: '/med-ai'
    },
    {
      num: '02',
      title: 'Choose a Doctor & Book a Slot',
      subtitle: 'Verified Medical Specialist Roster',
      icon: Calendar,
      color: 'from-teal-500/20 to-teal-600/10 text-teal-400 border-teal-500/30',
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      description:
        'Browse board-certified doctors by specialty, qualification, experience, and fee. Pick an available appointment time that works for you with instant confirmation and automated email receipts.',
      bullets: [
        'Filter by Cardiology, Dermatology, Neurology, and more',
        'Transparent consultation fees with no hidden costs',
        'Live slot collision prevention and 1-click booking'
      ],
      ctaText: 'Browse Doctors',
      ctaLink: '/'
    },
    {
      num: '03',
      title: 'Join Your Private Video Visit',
      subtitle: 'Browser-Native Encrypted WebRTC Call',
      icon: Video,
      color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description:
        'When your appointment time arrives, open your consultation room with 1 click. Connect directly in your browser with high-definition audio/video, camera/mic controls, and in-call messaging.',
      bullets: [
        'Zero downloads or app installations required',
        '256-bit encrypted peer-to-peer media stream',
        'Real-time in-call text chat and clinical notes'
      ],
      ctaText: 'View Dashboard',
      ctaLink: '/login'
    },
    {
      num: '04',
      title: 'Receive Digital Prescriptions',
      subtitle: 'Signed Medical Rx & Care Instructions',
      icon: FileText,
      color: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description:
        'Following your visit, your doctor generates an official digital prescription with exact medications, dosages, frequency, and care advice. Access it instantly in your patient portal or download for pharmacy use.',
      bullets: [
        'Official doctor signature and license accreditation',
        'Detailed dosage schedules and dietary recommendations',
        'Permanent record stored securely in your patient portal'
      ],
      ctaText: 'Access Patient Portal',
      ctaLink: '/login'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full clinical-card border border-sky-500/20 text-sky-400 text-xs font-semibold">
          <Clock className="w-4 h-4" />
          <span>Simple 4-Step Virtual Healthcare</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          How MediConnect Works
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          From your first symptom check to a signed prescription, here is how easy it is to receive medical care from home.
        </p>
      </div>

      {/* 4 Steps Timeline Grid */}
      <div className="space-y-8">
        {steps.map((step, idx) => {
          const Icon = step.icon;

          return (
            <div
              key={idx}
              className="clinical-card p-6 sm:p-8 rounded-2xl border border-white/5 relative overflow-hidden transition-all hover:border-sky-500/20"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Left Side: Number & Icon */}
                <div className="lg:col-span-4 flex items-center space-x-4">
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-600 font-mono">
                    {step.num}
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${step.color} border shadow-lg shrink-0`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${step.badgeColor} uppercase tracking-wider block mb-1`}>
                      Step {idx + 1}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white">{step.title}</h2>
                    <p className="text-xs text-slate-400">{step.subtitle}</p>
                  </div>
                </div>

                {/* Right Side: Description & Bullets */}
                <div className="lg:col-span-8 space-y-4">
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                    {step.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      to={step.ctaLink}
                      className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300"
                    >
                      <span>{step.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Technical Standards Bar */}
      <div className="clinical-card p-6 sm:p-8 rounded-2xl border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="space-y-1">
          <Laptop className="w-6 h-6 text-sky-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No Downloads Required</h3>
          <p className="text-xs text-slate-400">Runs directly in modern web browsers on desktop, iOS, and Android.</p>
        </div>
        <div className="space-y-1">
          <Lock className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">End-to-End Encrypted</h3>
          <p className="text-xs text-slate-400">WebRTC peer-to-peer media streams with DTLS/SRTP 256-bit security.</p>
        </div>
        <div className="space-y-1">
          <ShieldCheck className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">Board-Certified Doctors</h3>
          <p className="text-xs text-slate-400">Physicians are licensed and verified prior to practicing on the network.</p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Ready to consult a doctor?</h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/" className="clinical-btn-primary px-6 py-3 rounded-xl text-xs font-semibold">
            Book an Appointment
          </Link>
          <Link to="/med-ai" className="clinical-card px-6 py-3 rounded-xl text-xs font-semibold text-slate-200 hover:text-white border border-white/10">
            Check Symptoms with AI
          </Link>
        </div>
      </div>

    </div>
  );
};

export default HowItWorksPage;
