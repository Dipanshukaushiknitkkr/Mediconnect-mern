import React, { useState } from 'react';
import API from '../services/api';
import { X, Sparkles, AlertTriangle, ShieldCheck, UserCheck, ArrowRight, Loader2 } from 'lucide-react';

const AISymptomModal = ({ isOpen, onClose, onSelectDoctor }) => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    "Severe headache with sensitivity to light for 2 days",
    "Chest tightness and mild shortness of breath when walking",
    "Persistent dry cough, mild fever, and body aches",
    "Itchy red skin rash spreading on arms"
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
      setError(err.response?.data?.message || 'Failed to process AI triage. Please try again.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/80 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/60 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Med AI Symptom Assistant</h3>
            <p className="text-xs text-slate-400">Instant clinical triage & doctor specialization recommendation</p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleTriage} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Describe how you are feeling or what symptoms you have:
            </label>
            <textarea
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., I have been experiencing a throbbing headache, slight dizziness, and nausea since yesterday..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Quick Prompts */}
          <div>
            <p className="text-xs text-slate-400 mb-2 font-medium">Or select a quick example prompt:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSymptoms(prompt)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors text-left"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !symptoms.trim()}
            className="w-full py-3 rounded-2xl gradient-btn font-semibold text-white flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing Symptoms with Med AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-purple-200" />
                <span>Analyze Symptoms & Find Specialist</span>
              </>
            )}
          </button>
        </form>

        {/* Triage Results */}
        {result && (
          <div className="space-y-6 pt-4 border-t border-slate-800 animate-slide-up">
            <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Specialty Suggested</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {result.triage.suggestedSpecialty}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Urgency Assessment</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getUrgencyColor(result.triage.urgencyLevel)}`}>
                  {result.triage.urgencyLevel} Priority
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-sm text-slate-200 leading-relaxed"><span className="font-semibold text-purple-300">Med AI Assessment: </span>{result.triage.summary}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-200"><span className="font-semibold">Recommended Action: </span>{result.triage.recommendedAction}</p>
              </div>

            </div>

            {/* Recommended Matching Doctors */}
            {result.recommendedDoctors && result.recommendedDoctors.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Matching Specialists Available Now:</span>
                </h4>

                <div className="space-y-3">
                  {result.recommendedDoctors.map((doc) => (
                    <div
                      key={doc._id}
                      className="glass-panel p-4 rounded-2xl flex items-center justify-between hover:border-blue-500/40 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={doc.user?.avatar}
                          alt={doc.user?.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/30"
                        />
                        <div>
                          <h5 className="font-bold text-white text-sm">{doc.user?.name}</h5>
                          <p className="text-xs text-blue-400">{doc.specialty} • {doc.experienceYears} Years Exp.</p>
                          <p className="text-[11px] text-slate-400">${doc.hourlyFee} / consultation</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          if (onSelectDoctor) onSelectDoctor(doc);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1 transition-colors shadow"
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

      </div>
    </div>
  );
};

export default AISymptomModal;
