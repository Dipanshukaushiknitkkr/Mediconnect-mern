import React, { useState } from 'react';
import API from '../services/api';
import BookingModal from '../components/BookingModal';
import {
  Sparkles,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  HelpCircle,
  Bot,
  User
} from 'lucide-react';

const MedAIPage = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [selectedBodyArea, setSelectedBodyArea] = useState(null);

  // Tappable body-area chips with plain-language symptom templates
  const bodyAreaChips = [
    { name: 'Head', example: 'I have had a severe throbbing headache with light sensitivity since yesterday.' },
    { name: 'Chest', example: 'I have mild chest tightness and shortness of breath during light physical exertion.' },
    { name: 'Stomach', example: 'I have sudden stomach cramping, nausea, and indigestion after eating.' },
    { name: 'Skin', example: 'I have a bad rash on my arm that itches like crazy and feels warm.' },
    { name: 'Joints', example: 'My knees and lower back feel stiff and ache whenever I stand up.' },
    { name: 'Mood', example: 'I have had constant fatigue, sleep trouble, and elevated stress this past week.' }
  ];

  const handleChipClick = (chip) => {
    setSelectedBodyArea(chip.name);
    setSymptoms(chip.example);
  };

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

  const getUrgencyBadge = (level) => {
    switch (level) {
      case 'Emergency': return 'bg-[#C4501F]/15 text-[#C4501F] border border-[#C4501F]/30';
      case 'High': return 'bg-[#C4501F]/10 text-[#C4501F] border border-[#C4501F]/20';
      case 'Moderate': return 'bg-[#F2E9DA] text-[#1F4D3D] border border-[#1F4D3D]/20';
      default: return 'bg-[#DCEAE1] text-[#1F4D3D] border border-[#1F4D3D]/30';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C2B24]">
          AI Symptom Triage & Care Matching
        </h1>
        <p className="text-sm text-[#53655D] leading-relaxed">
          Describe what you are feeling in your own words. Our clinical intake assistant helps evaluate your symptoms and connects you with the right specialist.
        </p>
      </div>

      {/* Conversational Chat & Input Container */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DFD3] shadow-sm space-y-6">
        
        {/* Conversational Message Bubbles */}
        <div className="space-y-4 pb-4 border-b border-[#E8DFD3]">
          
          {/* 1. Bot Intro Bubble */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#1F4D3D] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-[#FBF6EF]" />
            </div>
            <div className="bg-[#DCEAE1] text-[#1C2B24] p-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed max-w-lg">
              <p className="font-semibold text-xs text-[#1F4D3D] mb-1">MedAI Assistant</p>
              <p>Hello! I am your virtual clinical intake assistant. What symptoms or health concerns are you experiencing today?</p>
            </div>
          </div>

          {/* 2. Example User Query Bubble */}
          <div className="flex items-start justify-end space-x-3">
            <div className="bg-[#F2E9DA] text-[#1C2B24] p-4 rounded-2xl rounded-tr-sm text-sm leading-relaxed max-w-lg text-left">
              <p className="font-semibold text-xs text-[#C4501F] mb-1">Patient Example</p>
              <p>"I have a bad rash on my arm that itches like crazy and feels warm to the touch."</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#F2E9DA] text-[#1F4D3D] flex items-center justify-center shrink-0 mt-0.5 border border-[#E8DFD3]">
              <User className="w-4 h-4 text-[#1F4D3D]" />
            </div>
          </div>

          {/* 3. Follow-up Bot Guidance Bubble */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#1F4D3D] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-[#FBF6EF]" />
            </div>
            <div className="bg-[#DCEAE1] text-[#1C2B24] p-3.5 rounded-2xl rounded-tl-sm text-xs sm:text-sm leading-relaxed max-w-lg">
              <p className="text-[#53655D]">You can select a body area below or type your symptoms directly into the box.</p>
            </div>
          </div>

        </div>

        {/* Tappable Body-Area Quick-Entry Chips */}
        <div>
          <label className="block text-xs font-semibold text-[#53655D] mb-2 uppercase tracking-wider">
            Quick Entry: Select Affected Area
          </label>
          <div className="flex flex-wrap gap-2">
            {bodyAreaChips.map((chip) => {
              const isSelected = selectedBodyArea === chip.name;
              return (
                <button
                  key={chip.name}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'bg-[#1F4D3D] text-white border-[#1F4D3D]'
                      : 'bg-[#FBF6EF] text-[#1C2B24] border-[#E8DFD3] hover:border-[#1F4D3D]/40'
                  }`}
                >
                  {chip.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Input Form */}
        <form onSubmit={handleTriage} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C2B24] mb-1.5">
              Describe your symptoms:
            </label>
            <textarea
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., I've had a bad cough and mild fever for the past 2 days..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DFD3] text-[#1C2B24] placeholder-[#7B8D85] focus:outline-none focus:border-[#1F4D3D] focus:ring-1 focus:ring-[#1F4D3D] text-sm"
            />
          </div>

          {error && <p className="text-xs text-[#C4501F] font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={loading || !symptoms.trim()}
            className="w-full py-3.5 rounded-xl btn-cta-primary font-semibold text-white text-sm flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating symptoms...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Evaluate Symptoms & Match Doctor</span>
              </>
            )}
          </button>
        </form>

      </div>

      {/* AI Triage Results Section */}
      {result && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E8DFD3] space-y-5 shadow-sm">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#E8DFD3]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7B8D85] block mb-0.5">Recommended Specialty</span>
                <span className="text-lg font-bold text-[#1F4D3D]">{result.triage.suggestedSpecialty}</span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7B8D85] block mb-0.5">Urgency Level</span>
                <span className={`px-3 py-1 rounded-md text-xs font-bold ${getUrgencyBadge(result.triage.urgencyLevel)}`}>
                  {result.triage.urgencyLevel} Priority
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FBF6EF] border border-[#E8DFD3] space-y-1">
              <span className="text-xs font-semibold text-[#1F4D3D] uppercase block tracking-wider">Clinical Assessment</span>
              <p className="text-xs sm:text-sm text-[#1C2B24] leading-relaxed">{result.triage.summary}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#DCEAE1] border border-[#1F4D3D]/20 flex items-start space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-[#1F4D3D] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-[#1F4D3D] uppercase block mb-0.5 tracking-wider">Recommended Next Step</span>
                <p className="text-xs sm:text-sm text-[#1C2B24] leading-relaxed">{result.triage.recommendedAction}</p>
              </div>
            </div>

            {result.triage.keyQuestions && result.triage.keyQuestions.length > 0 && (
              <div className="p-4 rounded-xl bg-[#FBF6EF] border border-[#E8DFD3] space-y-2">
                <span className="text-xs font-semibold text-[#53655D] uppercase tracking-wider flex items-center">
                  <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-[#1F4D3D]" />
                  Questions to Prepare for Your Doctor
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#1C2B24]">
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
              <h3 className="text-lg font-bold font-serif text-[#1C2B24] flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-[#1F4D3D]" />
                <span>Matching Verified Doctors:</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.recommendedDoctors.map((doc) => (
                  <div
                    key={doc._id}
                    className="bg-white p-5 rounded-xl flex items-center justify-between border border-[#E8DFD3] shadow-sm hover:border-[#1F4D3D]/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={doc.user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
                        alt={doc.user?.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#E8DFD3]"
                      />
                      <div>
                        <h5 className="font-bold text-[#1C2B24] text-sm">{doc.user?.name}</h5>
                        <p className="text-xs text-[#53655D]">{doc.specialty} • {doc.experienceYears || 10} yrs exp</p>
                        <p className="text-xs font-semibold text-[#1C2B24] mt-0.5 tabular-nums">${doc.hourlyFee || 85} / visit</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setBookingDoctor(doc)}
                      className="btn-cta-primary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm"
                    >
                      <span>Book</span>
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

      {/* Clinical Disclaimer */}
      <div className="text-center p-3.5 bg-white rounded-xl border border-[#E8DFD3] text-xs text-[#53655D]">
        <p>MedAI provides clinical guidance and triage assistance. For medical emergencies, please dial your local emergency services immediately.</p>
      </div>

    </div>
  );
};

export default MedAIPage;
