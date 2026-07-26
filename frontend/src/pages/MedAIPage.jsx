import React, { useState } from 'react';
import API from '../services/api';
import BookingModal from '../components/BookingModal';
import { Sparkles, ShieldCheck, UserCheck, ArrowRight, Loader2, Stethoscope, AlertTriangle } from 'lucide-react';

const MedAIPage = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState(null);

  const quickPrompts = [
    "Severe headache with sensitivity to light for 2 days",
    "Chest tightness and mild shortness of breath when walking",
    "Persistent dry cough, mild fever, and body aches",
    "Itchy red skin rash spreading on arms and back"
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
      setError(err.response?.data?.message || 'Failed to process Med AI triage. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'Emergency': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'High': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Moderate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Med AI Hero Banner */}
      <div className="glass-panel p-8 rounded-3xl text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>Google Gemini 2.0 Medical Intelligence</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Med <span className="gradient-text">AI Clinical Triage</span> Assistant
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Describe your symptoms to receive instant medical specialization recommendations, urgency assessment, and matching certified doctor slots.
        </p>
      </div>

      {/* Input Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border-slate-700/80 shadow-2xl">
        <form onSubmit={handleTriage} className="space-y-4">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
              Describe your health condition & symptoms in detail:
            </label>
            <textarea
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., I have been experiencing a throbbing headache, slight dizziness, and nausea since yesterday after working late..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm transition-colors"
            />
          </div>

          {/* Quick Example Prompts */}
          <div>
            <p className="text-xs text-slate-400 mb-2 font-semibold">Or select a common symptom prompt:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSymptoms(prompt)}
                  className="text-xs px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors text-left font-medium"
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
            className="w-full py-4 rounded-2xl gradient-btn font-bold text-white text-base flex items-center justify-center space-x-2 shadow-xl disabled:opacity-50 hover:scale-[1.01] transition-transform"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Med AI is Analyzing Symptoms...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-purple-200" />
                <span>Run Med AI Triage & Match Specialist</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* AI Triage Results Section */}
      {result && (
        <div className="space-y-6 animate-slide-up">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-purple-500/30 space-y-6 shadow-2xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Suggested Specialty</span>
                <span className="text-xl font-extrabold text-blue-400">{result.triage.suggestedSpecialty}</span>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Triage Priority</span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold border ${getUrgencyColor(result.triage.urgencyLevel)}`}>
                  {result.triage.urgencyLevel} Priority
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-purple-300 uppercase block">Clinical Impression</span>
              <p className="text-sm text-slate-200 leading-relaxed">{result.triage.summary}</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start space-x-3">
              <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-blue-300 uppercase block mb-0.5">Recommended Action</span>
                <p className="text-xs text-blue-200 leading-relaxed">{result.triage.recommendedAction}</p>
              </div>
            </div>

            {result.triage.keyQuestions && result.triage.keyQuestions.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Key Health Questions</span>
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
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <span>Matching Verified Specialists:</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.recommendedDoctors.map((doc) => (
                  <div
                    key={doc._id}
                    className="glass-panel p-5 rounded-2xl flex items-center justify-between hover:border-blue-500/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={doc.user?.avatar}
                        alt={doc.user?.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/30"
                      />
                      <div>
                        <h5 className="font-bold text-white text-sm">{doc.user?.name}</h5>
                        <p className="text-xs text-blue-400">{doc.specialty} • {doc.experienceYears} Yrs Exp.</p>
                        <p className="text-[11px] text-slate-400">${doc.hourlyFee} / consultation</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setBookingDoctor(doc)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow"
                    >
                      <span>Book Slot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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

    </div>
  );
};

export default MedAIPage;
