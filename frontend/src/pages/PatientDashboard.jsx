import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import PrescriptionModal from '../components/PrescriptionModal';
import { Calendar, Video, FileText, Activity, Heart, Droplets, Footprints, Scale, User, CreditCard, Clock, ShieldCheck, Edit3, Save, Sparkles, RefreshCw, XCircle } from 'lucide-react';

const PatientDashboard = ({ onOpenAIBot }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescriptionApt, setSelectedPrescriptionApt] = useState(null);

  // Health Vitals State
  const [vitals, setVitals] = useState({
    heartRate: '72',
    bloodPressure: '120/80',
    weight: '68',
    waterIntake: '2.5',
    steps: '8,420'
  });
  const [showVitalsModal, setShowVitalsModal] = useState(false);

  // Profile Edit State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bloodGroup: user?.bloodGroup || 'O+',
    allergies: user?.allergies || 'None',
    emergencyContact: user?.emergencyContact || ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 3000);
    return () => clearInterval(interval);
  }, []);

  // Real-time socket push listener for instant appointment status updates / cancellations
  useEffect(() => {
    if (!socket) return;

    const handleAppointmentUpdate = (updatedApt) => {
      setAppointments((prev) => {
        const exists = prev.some((a) => a._id === updatedApt._id);
        if (!exists) {
          const isForMe =
            (updatedApt.patient?._id || updatedApt.patient) === user?._id ||
            (updatedApt.doctor?._id || updatedApt.doctor) === user?._id;
          return isForMe ? [updatedApt, ...prev] : prev;
        }
        return prev.map((a) => (a._id === updatedApt._id ? updatedApt : a));
      });

      if (updatedApt.status === 'CANCELLED') {
        toast.info('An appointment was just cancelled.');
      }
    };

    socket.on('appointment-updated', handleAppointmentUpdate);
    return () => socket.off('appointment-updated', handleAppointmentUpdate);
  }, [socket, user]);

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Fetch appointments error:', err.message);
      toast.error('Could not load your appointments. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (aptId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled consultation?')) return;

    try {
      const res = await API.patch(`/appointments/${aptId}/status`, { status: 'CANCELLED' });
      if (res.data.success) {
        toast.info('Consultation cancelled successfully.');
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const res = await API.put('/auth/profile', profileData);
      if (res.data.success) {
        toast.success('Patient profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const upcomingApt = appointments.find((a) => a.status === 'SCHEDULED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Patient Header Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border-slate-800">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-blue-500/30"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome back, {user?.name}!</h1>
            <p className="text-xs sm:text-sm text-slate-400">Patient Telehealth Portal • Manage appointments, vitals & video rooms</p>
          </div>
        </div>

        <button
          onClick={onOpenAIBot}
          className="gradient-btn px-5 py-3 rounded-2xl font-bold text-white text-xs flex items-center space-x-2 shadow-lg hover:scale-105 transition-transform"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>Launch Med AI Triage</span>
        </button>
      </div>

      {/* ALWAYS VISIBLE TOP BANNER: ACTIVE UPCOMING CONSULTATION */}
      {upcomingApt ? (
        <div className="glass-panel p-6 rounded-3xl border-2 border-emerald-500/50 space-y-4 shadow-2xl bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <span>ACTIVE UPCOMING CONSULTATION READY</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/40">
              {upcomingApt.date} • {upcomingApt.timeSlot}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div className="flex items-center space-x-4">
              <img
                src={upcomingApt.doctor?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Doc'}
                alt={upcomingApt.doctor?.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/40"
              />
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Dr. {upcomingApt.doctor?.name || 'Medical Specialist'}
                </h3>
                <p className="text-xs text-slate-300">
                  Payment Status: <strong className="text-emerald-400">PAID (${upcomingApt.amount})</strong> • Tx ID: {upcomingApt.paymentId || 'PAY-782910'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Notes: "{upcomingApt.patientNotes || 'General consultation'}"</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to={`/video-room/${upcomingApt.meetingRoomId}?name=${encodeURIComponent(user?.name)}`}
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-xl hover:scale-105 transition-transform"
              >
                <Video className="w-4 h-4" />
                <span>Join Video Room</span>
              </Link>

              <button
                onClick={() => handleCancelAppointment(upcomingApt._id)}
                className="px-4 py-3.5 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold transition-all"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl glass-panel text-center flex items-center justify-between border-slate-800">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-slate-300 font-semibold">No active upcoming consultations queued.</span>
          </div>
          <Link to="/" className="text-xs font-bold text-blue-400 hover:underline">
            Book a Specialist Now →
          </Link>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Health Vitals</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'appointments' ? 'bg-blue-600 text-white shadow-lg' : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>All Appointments & Receipts ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Edit Patient Profile</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & HEALTH TRACKER */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span>Health Vitals Tracker</span>
              </h3>
              <button
                onClick={() => setShowVitalsModal(true)}
                className="px-3 py-1.5 rounded-xl glass-panel text-xs font-bold text-blue-400 hover:text-white flex items-center space-x-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Update Vitals</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="glass-panel p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                  <span>Heart Rate</span>
                  <Heart className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{vitals.heartRate} <span className="text-xs font-normal text-slate-400">BPM</span></div>
                <p className="text-[10px] text-emerald-400 font-semibold">Normal Resting Rate</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                  <span>Blood Pressure</span>
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{vitals.bloodPressure} <span className="text-xs font-normal text-slate-400">mmHg</span></div>
                <p className="text-[10px] text-emerald-400 font-semibold">Optimal Range</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                  <span>Body Weight</span>
                  <Scale className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{vitals.weight} <span className="text-xs font-normal text-slate-400">kg</span></div>
                <p className="text-[10px] text-slate-400">BMI: 22.4 (Healthy)</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                  <span>Water Intake</span>
                  <Droplets className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{vitals.waterIntake} <span className="text-xs font-normal text-slate-400">L</span></div>
                <p className="text-[10px] text-cyan-400 font-semibold">82% Daily Goal</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl space-y-2 col-span-2 md:col-span-1">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                  <span>Daily Steps</span>
                  <Footprints className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-extrabold text-white">{vitals.steps}</div>
                <p className="text-[10px] text-amber-400 font-semibold">Active Day</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENT HISTORY & RECEIPTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-white">Consultation Records & Payment Receipts</h3>

          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt._id} className="glass-panel p-6 rounded-3xl space-y-4 border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <h4 className="font-extrabold text-white text-base">
                        Dr. {apt.doctor?.name || 'Medical Specialist'}
                      </h4>
                      <p className="text-xs text-slate-400">Date: {apt.date} • Time Slot: {apt.timeSlot}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        apt.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        apt.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Payment Status: <strong className="text-emerald-400 uppercase">{apt.paymentStatus || 'PAID'}</strong></span>
                    </div>
                    <div>Transaction ID: <strong className="text-slate-200">{apt.paymentId || 'PAY-849204'}</strong></div>
                    <div>Amount Paid: <strong className="text-white">${apt.amount}</strong></div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-3">
                      {apt.status === 'SCHEDULED' && (
                        <Link
                          to={`/video-room/${apt.meetingRoomId}?name=${encodeURIComponent(user?.name)}`}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Video Room</span>
                        </Link>
                      )}

                      <button
                        onClick={() => setSelectedPrescriptionApt(apt)}
                        className="px-4 py-2 rounded-xl glass-panel text-slate-200 hover:text-white text-xs font-bold flex items-center space-x-1.5"
                      >
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span>View Prescription / Notes</span>
                      </button>
                    </div>

                    {apt.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleCancelAppointment(apt._id)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-panel rounded-3xl">
              <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No consultation records found.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EDIT PATIENT PROFILE */}
      {activeTab === 'profile' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl mx-auto space-y-6 border-slate-800">
          <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-400" />
            <span>Edit Patient Information</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Blood Group
                </label>
                <select
                  value={profileData.bloodGroup}
                  onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Known Medical Allergies
              </label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Dust, Peanuts, None"
                value={profileData.allergies}
                onChange={(e) => setProfileData({ ...profileData, allergies: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Emergency Contact Number
              </label>
              <input
                type="text"
                placeholder="Emergency Contact Phone"
                value={profileData.emergencyContact}
                onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-3 rounded-2xl gradient-btn font-bold text-white text-xs flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Prescription Modal */}
      {selectedPrescriptionApt && (
        <PrescriptionModal
          appointment={selectedPrescriptionApt}
          isOpen={!!selectedPrescriptionApt}
          onClose={() => setSelectedPrescriptionApt(null)}
        />
      )}

      {/* Update Vitals Modal */}
      {showVitalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full space-y-4 border-slate-700">
            <h3 className="text-lg font-bold text-white">Record New Vitals</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Heart Rate (BPM)</label>
                <input
                  type="text"
                  value={vitals.heartRate}
                  onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Blood Pressure (mmHg)</label>
                <input
                  type="text"
                  value={vitals.bloodPressure}
                  onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Weight (kg)</label>
                <input
                  type="text"
                  value={vitals.weight}
                  onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
            <button
              onClick={() => {
                setShowVitalsModal(false);
                toast.success('Health vitals updated!');
              }}
              className="w-full py-2.5 rounded-xl gradient-btn font-bold text-xs text-white"
            >
              Update Vitals
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientDashboard;
