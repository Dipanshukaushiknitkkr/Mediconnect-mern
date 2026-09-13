import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertTriangle, ShieldCheck, HeartPulse, Stethoscope } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const TermsOfServicePage = () => {
  usePageMeta(
    'Terms of Service',
    'MediConnect terms of service, platform scope, and emergency medical notices.'
  );
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full clinical-card border border-sky-500/20 text-sky-400 text-xs font-semibold">
          <FileText className="w-3.5 h-3.5" />
          <span>Legal & Service Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Terms of Service</h1>
        <p className="text-xs text-slate-400">Last updated: September 2026 • Terms of Platform Usage</p>
      </div>

      {/* Critical Medical Emergency Warning */}
      <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start space-x-4">
        <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-xs sm:text-sm text-slate-300">
          <h2 className="font-bold text-red-300 text-sm">Medical Emergency Notice</h2>
          <p className="text-slate-400 leading-relaxed">
            MediConnect is not intended for emergency medical scenarios. If you are experiencing a life-threatening medical emergency (such as severe chest pain, shortness of breath, acute stroke symptoms, or severe trauma), please dial <strong>911</strong> (or your local emergency hotline) or visit your nearest hospital emergency department immediately.
          </p>
        </div>
      </div>

      {/* Terms Content */}
      <div className="clinical-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">1. Platform Nature & Demonstration Scope</h2>
          <p className="text-slate-400">
            MediConnect is an interactive telehealth engineering showcase and portfolio project. While built with production-grade full-stack architecture (Node.js, React, WebRTC, Socket.io, MongoDB, and Gemini AI), the platform is presented for demonstration and educational purposes.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-white/5">
          <h2 className="text-base font-bold text-white">2. MedAI Symptom Triage Tool Disclaimer</h2>
          <p className="text-slate-400">
            The MedAI triage assistant provides automated clinical guidance and specialty recommendations based on artificial intelligence and heuristic medical rules. MedAI does not provide a definitive medical diagnosis, nor does it replace comprehensive physical examination by a licensed medical practitioner.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-white/5">
          <h2 className="text-base font-bold text-white">3. User Responsibilities & Account Security</h2>
          <p className="text-slate-400">
            Users agree to provide accurate information when scheduling appointments or providing medical background notes. You are responsible for safeguarding your login credentials and maintaining the confidentiality of your account session.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-white/5">
          <h2 className="text-base font-bold text-white">4. Modifications to Service</h2>
          <p className="text-slate-400">
            We reserve the right to modify or update features, database demonstration schemas, or these terms to reflect ongoing software development and testing improvements.
          </p>
        </section>

      </div>

    </div>
  );
};

export default TermsOfServicePage;
