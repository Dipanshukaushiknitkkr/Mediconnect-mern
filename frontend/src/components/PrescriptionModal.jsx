import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { X, FileText, Plus, Trash2, CheckCircle2, Download, Stethoscope } from 'lucide-react';

const PrescriptionModal = ({ appointment, isDoctorView, isOpen, onClose }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([
    { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily after meals', duration: '3 days' }
  ]);
  const [advice, setAdvice] = useState('Maintain good hydration, rest, and follow up if symptoms persist.');
  const [existingPrescription, setExistingPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen && appointment) {
      fetchPrescription();
    }
  }, [isOpen, appointment]);

  const fetchPrescription = async () => {
    try {
      const res = await API.get(`/appointments/${appointment._id}/prescription`);
      if (res.data.success && res.data.prescription) {
        setExistingPrescription(res.data.prescription);
        setDiagnosis(res.data.prescription.diagnosis);
        setMedicines(res.data.prescription.medicines);
        setAdvice(res.data.prescription.advice);
      }
    } catch (err) {
      // Prescription not created yet for this appointment
    }
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      const res = await API.post(`/appointments/${appointment._id}/prescription`, {
        diagnosis,
        medicines,
        advice
      });
      if (res.data.success) {
        setExistingPrescription(res.data.prescription);
        setMessage('Prescription saved and issued successfully!');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error saving prescription');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/80 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/60 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Prescription Header */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Digital Rx Prescription</h3>
            <p className="text-xs text-slate-400">Appointment #{appointment.meetingRoomId} • Date: {appointment.date}</p>
          </div>
        </div>

        {isDoctorView ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Clinical Diagnosis
              </label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Upper Respiratory Infection"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Medicines List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Prescribed Medicines
                </label>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="flex items-center space-x-1 text-xs text-blue-400 font-semibold hover:text-blue-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-3">
                {medicines.map((med, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2 relative group">
                    <input
                      type="text"
                      placeholder="Medicine Name"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Frequency (e.g. 1-0-1)"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        placeholder="Duration (e.g. 5 days)"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Medical Advice & Lifestyle Instructions
              </label>
              <textarea
                rows={3}
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {message && <p className="text-xs text-emerald-400 font-semibold">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl gradient-btn font-bold text-white text-sm shadow-lg disabled:opacity-50"
            >
              {loading ? 'Saving Prescription...' : 'Issue Prescription'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {existingPrescription ? (
              <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-5">
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <span className="text-xs font-bold text-purple-300 uppercase block mb-1">Diagnosis</span>
                  <p className="text-sm font-semibold text-white">{existingPrescription.diagnosis}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prescribed Medications</h4>
                  <div className="space-y-2">
                    {existingPrescription.medicines.map((med, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-white block text-sm">{med.name}</span>
                          <span className="text-slate-400">{med.frequency} • {med.duration}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold">{med.dosage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-slate-400 block mb-1">Doctor's Advice</span>
                  <p>{existingPrescription.advice}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm">No prescription issued yet for this appointment.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default PrescriptionModal;
