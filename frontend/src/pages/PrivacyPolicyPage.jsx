import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, EyeOff, Server, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const PrivacyPolicyPage = () => {
  usePageMeta(
    'Privacy Policy',
    'MediConnect privacy policy and encrypted peer-to-peer data protection standards.'
  );
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full clinical-card border border-sky-500/20 text-sky-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy & Data Protection Notice</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Last updated: September 2026 • Effective immediately</p>
      </div>

      {/* Honest Portfolio Project Disclaimer Banner */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-300">
          <h2 className="font-bold text-amber-300 text-sm">Demonstration & Portfolio Environment Notice</h2>
          <p className="leading-relaxed">
            MediConnect is an open-source software engineering demonstration platform. No real patient Protected Health Information (PHI) is collected, transmitted, or sold. All doctor profiles, appointment schedules, and consultation data are sandbox demo items.
          </p>
        </div>
      </div>

      {/* Privacy Sections */}
      <div className="clinical-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Lock className="w-4 h-4 text-sky-400" />
            <span>1. Information We Collect</span>
          </h2>
          <p className="text-slate-400">
            When creating an account on MediConnect, users provide basic identifying information for demonstration purposes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>Account credentials: Name, email address, password (stored exclusively as cryptographic bcrypt hashes).</li>
            <li>Consultation preferences: Selected specialty, preferred appointment date, and time slot.</li>
            <li>Voluntary symptom inputs: Text provided in the MedAI symptom triage tool for clinical routing.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-white/5">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>2. Video & Audio Stream Privacy (WebRTC)</span>
          </h2>
          <p className="text-slate-400">
            Video consultations on MediConnect are powered by browser-native WebRTC (Web Real-Time Communication):
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>Media streams travel peer-to-peer directly between the patient and doctor browser without intermediate recording.</li>
            <li>All video/audio packets are encrypted using standard 256-bit DTLS/SRTP protocols.</li>
            <li>MediConnect servers do not store, record, or retain audio or video consultation recordings.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-white/5">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <EyeOff className="w-4 h-4 text-teal-400" />
            <span>3. How We Use and Protect Data</span>
          </h2>
          <p className="text-slate-400">
            Data is strictly used to simulate appointment scheduling, role-based dashboards (Patient, Doctor, Admin), and digital prescription delivery:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
            <li>We do not sell, license, or market user email addresses or consultation details to any third-party advertisers.</li>
            <li>Stateless JSON Web Tokens (JWT) signed with secure secret keys protect all authenticated API interactions.</li>
            <li>Users can delete their accounts at any time through the Admin Governance interface or direct request.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-white/5">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>4. Contact & Inquiries</span>
          </h2>
          <p className="text-slate-400">
            If you have questions regarding this technical demonstration or wish to inspect the open-source codebase, please visit our <Link to="/contact" className="text-sky-400 underline font-semibold">Contact Page</Link> or review the <Link to="/about" className="text-sky-400 underline font-semibold">About Page</Link>.
          </p>
        </section>

      </div>

    </div>
  );
};

export default PrivacyPolicyPage;
