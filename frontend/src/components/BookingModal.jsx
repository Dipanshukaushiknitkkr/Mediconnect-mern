import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, CreditCard, CheckCircle, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';

const BookingModal = ({ doctor, isOpen, onClose, onBookingSuccess }) => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [step, setStep] = useState(1); // 1: Select Slot, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdAppointment, setCreatedAppointment] = useState(null);
  const [takenSlots, setTakenSlots] = useState([]);

  const availableSlots = [
    '09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'
  ];

  useEffect(() => {
    if (isOpen && doctor && selectedDate) {
      fetchBookedSlots();
    }
  }, [isOpen, doctor, selectedDate]);

  const fetchBookedSlots = async () => {
    try {
      const targetDoctorUserId = doctor.user?._id || doctor.user || doctor._id;
      const res = await API.get(`/appointments/booked-slots?doctorId=${targetDoctorUserId}&date=${selectedDate}`);
      if (res.data.success) {
        setTakenSlots(res.data.bookedSlots || []);
      }
    } catch (err) {
      console.error('Fetch booked slots error:', err.message);
    }
  };

  if (!isOpen || !doctor) return null;

  const handleBooking = async () => {
    if (!user) {
      toast.info('Please sign in or create an account to book a consultation.');
      navigate('/login');
      return;
    }
    if (!selectedSlot) {
      setError('Please select an available time slot for your appointment.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const targetDoctorUserId = doctor.user?._id || doctor.user || doctor._id;

      // 1. Create Appointment
      const res = await API.post('/appointments', {
        doctorId: targetDoctorUserId,
        date: selectedDate,
        timeSlot: selectedSlot,
        patientNotes
      });

      if (res.data.success) {
        const appointment = res.data.appointment;

        // 2. Process Payment
        await API.post('/payments/process', {
          appointmentId: appointment._id,
          paymentMethod: 'Credit Card (Razorpay Mock)'
        });

        setCreatedAppointment(appointment);
        toast.success('Appointment booked & payment confirmed!');
        if (onBookingSuccess) onBookingSuccess();
        setStep(3); // Confirmation step
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete booking. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to complete booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg clinical-card rounded-2xl p-6 sm:p-7 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Doctor Header */}
        <div className="flex items-center space-x-3.5 mb-5 pb-4 border-b border-white/10">
          <img
            src={doctor.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Doc'}
            alt={doctor.user?.name || 'Doctor'}
            className="w-12 h-12 rounded-xl object-cover ring-1 ring-sky-500/30"
          />
          <div>
            <h3 className="text-base font-bold text-white">{doctor.user?.name || 'Doctor'}</h3>
            <p className="text-xs text-sky-400 font-medium">{doctor.specialty} • ${doctor.hourlyFee}/session</p>
          </div>
        </div>

        {/* Step 1: Slot Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                Select Appointment Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot('');
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                  Select Time Slot
                </label>
                <span className="text-[10px] text-emerald-400 font-medium">Real-time availability</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => {
                  const isTaken = takenSlots.includes(slot);

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isTaken}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                        isTaken
                          ? 'bg-slate-900/40 border-white/5 text-slate-600 line-through cursor-not-allowed'
                          : selectedSlot === slot
                          ? 'bg-sky-600 border-sky-400 text-white shadow-md font-semibold'
                          : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-sky-500/40'
                      }`}
                    >
                      {slot} {isTaken && '(Booked)'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Consultation Reason / Chief Complaint (Optional)
              </label>
              <textarea
                rows={2}
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="Describe any symptoms or goals for your appointment..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

            <button
              onClick={() => {
                if (!selectedSlot) {
                  setError('Please select an available time slot.');
                  return;
                }
                setStep(2);
              }}
              className="w-full py-2.5 rounded-xl clinical-btn-primary text-xs font-semibold shadow-md flex items-center justify-center space-x-1.5"
            >
              <span>Continue to Confirmation (${doctor.hourlyFee})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Step 2: Payment & Confirmation */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 space-y-1.5">
              <div className="flex justify-between">
                <span>Attending Specialist:</span>
                <span className="font-semibold text-white">{doctor.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Scheduled Date & Time:</span>
                <span className="font-semibold text-white">{selectedDate} at {selectedSlot}</span>
              </div>
              <div className="flex justify-between border-t border-sky-500/20 pt-1.5 text-xs">
                <span className="font-semibold">Total Fee:</span>
                <span className="font-bold text-white tabular-nums">${doctor.hourlyFee} USD</span>
              </div>
            </div>

            {/* Demo / Sandbox Payment Indicator */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span><strong>Demo / Sandbox Mode</strong> — No real charge is made to your card.</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                  Simulated Payment Gateway
                </span>
                <span className="text-[10px] bg-sky-500/15 text-sky-400 px-2 py-0.5 rounded-md font-medium">Razorpay Sandbox</span>
              </div>
              <input
                type="text"
                disabled
                value="•••• •••• •••• 4242 (Simulated Sandbox Card)"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/5 text-xs text-slate-400 font-mono"
              />
            </div>

            {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

            <div className="flex space-x-2.5">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                Back
              </button>
              <button
                onClick={handleBooking}
                disabled={loading}
                className="w-2/3 py-2.5 rounded-xl clinical-btn-primary text-xs font-semibold flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Confirm & Book (${doctor.hourlyFee})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Screen */}
        {step === 3 && createdAppointment && (
          <div className="text-center space-y-3.5 py-3">
            <div className="w-12 h-12 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/20">
              <CheckCircle className="w-7 h-7" />
            </div>

            <h4 className="text-lg font-bold text-white">Consultation Confirmed</h4>
            <p className="text-xs text-slate-300">
              Your appointment with <span className="text-white font-semibold">{doctor.user?.name}</span> is confirmed for <span className="text-sky-400 font-semibold">{selectedDate}</span> at <span className="text-sky-400 font-semibold">{selectedSlot}</span>.
            </p>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-400 font-mono">
              Room ID: <span className="text-emerald-400 font-bold">{createdAppointment.meetingRoomId}</span>
            </div>

            <button
              onClick={() => {
                onClose();
                navigate('/dashboard');
              }}
              className="w-full py-2.5 rounded-xl clinical-btn-primary text-xs font-semibold shadow-md"
            >
              Open Patient Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookingModal;
