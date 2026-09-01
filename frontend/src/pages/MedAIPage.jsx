import React, { useState } from 'react';
import API from '../services/api';
import BookingModal from '../components/BookingModal';
import {
  Sparkles,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Loader2,
  Stethoscope,
  AlertTriangle,
  FileCheck2,
  HelpCircle
} from 'lucide-react';

const MedAIPage = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState(null);

  const quickPrompts = [
    "Severe throbbing migraine with light sensitivity for 2 days",
    "Chest tightness and mild shortness of breath during light exertion",
    "Persistent dry cough, fever spikes, and general body fatigue",
    "Pruritic erythematous rash spreading across arms and back"
  ];

  const handleTriage = async (e) => {
    if (e) e.preventDefault();
    if (!symptoms.trim()) return;

    try {
      setLoading(true);
      setError('');
      const res = await API.post('/ai/triage', { symptoms });
      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process MedAI triage. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'Emergency': return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'High': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Moderate': return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      default: return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* MedAI Hero Header */}
      <div className="clinical-card p-8 rounded-2xl text-center space-y-3 relative overflow-hidden border border-white/5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Clinical Symptom Triage Engine</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
          MedAI Diagnostic & Specialist Matching
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Provide your current symptoms to receive instant medical specialization recommendations, urgency triage scoring, and matching accredited physician slots.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="clinical-card p-6 sm:p-7 rounded-2xl space-y-5 border border-white/5 shadow-md">
        <form onSubmit={handleTriage} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Describe your health condition & clinical symptoms:
            </label>
            <textarea
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., I have had a continuous throbbing headache, mild photophobia, and slight nausea since yesterday after working long hours..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs sm:text-sm transition-colors"
            />
          </div>

          {/* Quick Example Prompts */}
          <div>
            <p className="text-xs text-slate-400 mb-1.5 font-medium">Or select a standard clinical symptom prompt:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSymptoms(prompt)}
                  className="text-xs px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-850 text-slate-300 border border-white/5 transition-colors text-left"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={loading || !symptoms.trim()}
            className="w-full py-3 rounded-xl clinical-btn-primary font-semibold text-white text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>MedAI is Analyzing Clinical Symptoms...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-sky-200" />
                <span>Evaluate Symptoms & Match Specialist</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* AI Triage Results Section */}
      {result && (
        <div className="space-y-6">
          <div className="clinical-card p-6 sm:p-7 rounded-2xl border border-sky-500/30 space-y-5 shadow-lg">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Recommended Specialization</span>
                <span className="text-lg font-bold text-sky-400">{result.triage.suggestedSpecialty}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Triage Severity</span>
                <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getUrgencyColor(result.triage.urgencyLevel)}`}>
                  {result.triage.urgencyLevel} Priority
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
              <span className="text-xs font-semibold text-sky-300 uppercase block tracking-wider">Clinical Summary</span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{result.triage.summary}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-start space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-sky-300 uppercase block mb-0.5 tracking-wider">Recommended Next Step</span>
                <p className="text-xs text-sky-200 leading-relaxed">{result.triage.recommendedAction}</p>
              </div>
            </div>

            {result.triage.keyQuestions && result.triage.keyQuestions.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                  <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                  Key Diagnostic Inquiries
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  {result.triage.keyQuestions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* Recommended Specialists List */}
          {result.recommendedDoctors && result.recommendedDoctors.length > 0 && (
            <div className="space-y-3.5">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Matching Verified Physicians:</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {result.recommendedDoctors.map((doc) => (
                  <div
                    key={doc._id}
                    className="clinical-card p-4 rounded-xl flex items-center justify-between hover:border-sky-500/40 transition-colors border border-white/5"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={doc.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Doctor'}
                        alt={doc.user?.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-sky-500/30"
                      />
                      <div>
                        <h5 className="font-bold text-white text-xs sm:text-sm">{doc.user?.name}</h5>
                        <p className="text-xs text-sky-400">{doc.specialty} • {doc.experienceYears} Yrs Exp.</p>
                        <p className="text-[11px] text-slate-400 tabular-nums">${doc.hourlyFee} / session</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setBookingDoctor(doc)}
                      className="px-3.5 py-1.5 rounded-lg clinical-btn-primary text-xs font-semibold flex items-center space-x-1 shadow-sm"
                    >
                      <span>Book Slot</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          isOpen={!!bookingDoctor}
          onClose={() => setBookingDoctor(null)}
        />
      )}

      {/* Clinical Disclaimer */}
      <div className="text-center p-3.5 clinical-card rounded-xl border border-white/5 text-[11px] text-slate-400">
        <p>⚡ Powered by <strong className="text-sky-300">MedAI Clinical Triage</strong>. For life-threatening emergencies, dial emergency services immediately.</p>
      </div>

    </div>
  );
};

export default MedAIPage;
