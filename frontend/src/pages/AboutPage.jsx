import React from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Code2,
  ShieldCheck,
  Video,
  Sparkles,
  HeartPulse,
  Database,
  Layers,
  ArrowRight,
  ExternalLink,
  Cpu,
  Mail
} from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const AboutPage = () => {
  usePageMeta(
    'About MediConnect & Architecture',
    'Learn about MediConnect telehealth engineering, full-stack architecture, and open-source portfolio scope.'
  );
  const stack = [
    { name: 'React 18 & Vite', desc: 'Single-page client runtime for persistent WebRTC video sessions and instant HMR.' },
    { name: 'Node.js & Express', desc: 'Event-driven asynchronous REST API gateway and rate-limited auth endpoints.' },
    { name: 'Socket.io', desc: 'Real-time WebSocket signaling, personal notification queues, and in-call chat.' },
    { name: 'WebRTC (P2P)', desc: 'Browser-native peer-to-peer 1080p video streaming with 256-bit DTLS/SRTP encryption.' },
    { name: 'MongoDB & Mongoose', desc: 'Document schemas for appointments, dynamic prescription arrays, and doctor reviews.' },
    { name: 'Google Gemini 2.0 AI', desc: 'Structured clinical symptom triage paired with a deterministic heuristic fallback engine.' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full clinical-card border border-sky-500/20 text-sky-400 text-xs font-semibold">
          <Stethoscope className="w-4 h-4" />
          <span>Project Overview & Engineering Showcase</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Modern Telemedicine, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
            Engineered for Real-World Care.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          MediConnect was created as a full-stack engineering demonstration of an integrated virtual healthcare platform — combining AI triage, browser-native encrypted video consultations, and digital prescription workflows.
        </p>
      </div>

      {/* Transparent Disclaimer Box */}
      <div className="p-5 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-start space-x-4">
        <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-xs sm:text-sm text-slate-300">
          <h2 className="font-bold text-white text-sm">Engineering Portfolio & Demonstration Project</h2>
          <p className="text-slate-400 leading-relaxed">
            This platform is an open-source demonstration created for technical evaluation and portfolio display. All doctor profiles, appointment schedules, and simulated video rooms operate on mock/sandbox healthcare data. No actual protected health information (PHI) is processed or shared with third parties.
          </p>
        </div>
      </div>

      {/* Why We Built This */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">Why MediConnect?</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Traditional telemedicine software is often fragmented across third-party video links, separate scheduling apps, and detached prescription portals.
          </p>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            MediConnect was engineered to unify the complete virtual consultation lifecycle under a single cohesive system: from initial AI symptom check and physician booking, to peer-to-peer WebRTC video rooms and pharmacist-ready digital prescriptions.
          </p>
        </div>

        <div className="clinical-card p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="font-bold text-white text-sm">Core Engineering Priorities:</h3>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start space-x-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
              <span><strong>Sub-100ms Video Latency</strong>: Direct peer-to-peer media streaming without routing video through costly third-party relays.</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span><strong>Slot Collision Prevention</strong>: Compound database indexing and atomic recycling for zero double-booking errors.</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <span><strong>AI Safety Fallbacks</strong>: Deterministic rule-engine safety nets backing generative AI triage models.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Tech Stack Summary Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold text-white tracking-tight">Technology Architecture</h2>
          <p className="text-xs text-slate-400">Full-stack components chosen for performance, reliability, and security.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stack.map((item, idx) => (
            <div key={idx} className="clinical-card p-5 rounded-xl border border-white/5 space-y-2">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span>{item.name}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="clinical-card p-8 rounded-2xl border border-sky-500/20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Experience the Platform in Action</h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Explore the specialist directory, test the MedAI symptom triage assistant, or start a sandbox video consultation.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/med-ai"
            className="clinical-btn-primary px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Try AI Triage</span>
          </Link>
          <Link
            to="/"
            className="px-6 py-2.5 rounded-xl clinical-card border border-white/10 text-xs font-semibold text-slate-200 hover:text-white"
          >
            <span>Browse Doctors</span>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default AboutPage;
