import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, CreditCard, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/80">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/60 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Doctor Header */}
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-800">
          <img
            src={doctor.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Doc'}
            alt={doctor.user?.name || 'Doctor'}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/40"
          />
          <div>
            <h3 className="text-lg font-bold text-white">{doctor.user?.name || 'Doctor'}</h3>
            <p className="text-xs text-blue-400 font-medium">{doctor.specialty} • ${doctor.hourlyFee}/session</p>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-5">
            {/* Date Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-blue-400" />
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
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Time Slot Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                  <Clock className="w-4 h-4 mr-1.5 text-purple-400" />
                  Select Time Slot
                </label>
                <span className="text-[10px] text-emerald-400 font-semibold">Cancelled/Completed slots auto-freed</span>
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
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        isTaken
                          ? 'bg-slate-900/50 border-slate-850 text-slate-600 line-through cursor-not-allowed'
                          : selectedSlot === slot
                          ? 'bg-blue-600 border-blue-400 text-white shadow-lg scale-105'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {slot} {isTaken && '(Booked)'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Patient Symptoms / Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Chief Complaint / Patient Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="Describe any symptoms or reasons for your consultation..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

            <button
              onClick={() => {
                if (!selectedSlot) {
                  setError('Please select an available time slot.');
                  return;
                }
                setStep(2);
              }}
              className="w-full py-3 rounded-2xl gradient-btn text-sm font-bold text-white shadow-lg"
            >
              Proceed to Payment (${doctor.hourlyFee})
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-2">
              <div className="flex justify-between">
                <span>Doctor:</span>
                <span className="font-bold text-white">{doctor.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span className="font-bold text-white">{selectedDate} at {selectedSlot}</span>
              </div>
              <div className="flex justify-between border-t border-blue-500/20 pt-2 text-sm">
                <span className="font-bold">Total Amount Due:</span>
                <span className="font-extrabold text-white">${doctor.hourlyFee} USD</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center">
                  <CreditCard className="w-4 h-4 text-emerald-400 mr-2" />
                  Razorpay / Stripe Payment Gateway
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">256-Bit SSL Encrypted</span>
              </div>
              <input
                type="text"
                disabled
                value="•••• •••• •••• 4242 (Demo Test Card)"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono"
              />
            </div>

            {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Back
              </button>
              <button
                onClick={handleBooking}
                disabled={loading}
                className="w-2/3 py-3 rounded-2xl gradient-btn text-sm font-bold text-white flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Confirm & Pay ${doctor.hourlyFee}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && createdAppointment && (
          <div className="text-center space-y-4 py-4 animate-scale-up">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/30">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h4 className="text-xl font-extrabold text-white">Appointment Confirmed!</h4>
            <p className="text-xs text-slate-400">
              Your video consultation with <span className="text-white font-semibold">{doctor.user?.name}</span> is scheduled for <span className="text-blue-400 font-bold">{selectedDate}</span> at <span className="text-purple-400 font-bold">{selectedSlot}</span>.
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
              Meeting ID: <span className="text-emerald-400 font-bold">{createdAppointment.meetingRoomId}</span>
            </div>

            <button
              onClick={() => {
                onClose();
                navigate('/dashboard');
              }}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white shadow-lg"
            >
              Go to Patient Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookingModal;
