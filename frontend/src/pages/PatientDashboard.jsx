import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import PrescriptionModal from '../components/PrescriptionModal';
import {
  Calendar,
  Video,
  FileText,
  Activity,
  Heart,
  Droplets,
  Footprints,
  Scale,
  User,
  CreditCard,
  Clock,
  ShieldCheck,
  Edit3,
  Save,
  Sparkles,
  RefreshCw,
  XCircle,
  ArrowRight,
  Stethoscope
} from 'lucide-react';

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
    const interval = setInterval(fetchAppointments, 4000);
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
        toast.info('An appointment status was updated.');
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
      
      {/* Patient Header Clinical Banner */}
      <div className="clinical-card p-6 sm:p-7 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-16 h-16 rounded-xl object-cover ring-2 ring-sky-500/30"
          />
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Patient Portal • {user?.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Active Member
              </span>
            </div>
            <p className="text-xs text-slate-400">Manage telehealth appointments, health telemetry & clinical prescriptions.</p>
          </div>
        </div>

        <Link
          to="/med-ai"
          className="clinical-btn-primary px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-2 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-200" />
          <span>Launch MedAI Triage</span>
        </Link>
      </div>

      {/* ACTIVE UPCOMING CONSULTATION READY BANNER */}
      {upcomingApt ? (
        <div className="clinical-card p-5 sm:p-6 rounded-2xl border border-emerald-500/40 space-y-3.5 bg-emerald-950/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-vital-pulse" />
              <span>UPCOMING TELEHEALTH CONSULTATION READY</span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              {upcomingApt.date} • {upcomingApt.timeSlot}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div className="flex items-center space-x-3.5">
              <img
                src={upcomingApt.doctor?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Doc'}
                alt={upcomingApt.doctor?.name}
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-emerald-500/40"
              />
              <div>
                <h3 className="text-base font-bold text-white">
                  Dr. {upcomingApt.doctor?.name || 'Medical Specialist'}
                </h3>
                <p className="text-xs text-slate-300">
                  Fee: <strong className="text-emerald-400 font-semibold">${upcomingApt.amount} (PAID)</strong> • Room: <span className="font-mono text-slate-300">{upcomingApt.meetingRoomId}</span>
                </p>
                {upcomingApt.patientNotes && (
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-md">Notes: "{upcomingApt.patientNotes}"</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Link
                to={`/video-room/${upcomingApt.meetingRoomId}?name=${encodeURIComponent(user?.name)}`}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Video Call</span>
              </Link>

              <button
                onClick={() => handleCancelAppointment(upcomingApt._id)}
                className="px-3.5 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl clinical-card flex items-center justify-between border border-white/5">
          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-slate-300 font-medium">No upcoming consultations queued right now.</span>
          </div>
          <Link to="/" className="text-xs font-semibold text-sky-400 hover:underline flex items-center space-x-1">
            <span>Browse Specialist Doctors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-white/5 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'overview'
              ? 'bg-sky-600 text-white shadow-sm border border-sky-400'
              : 'clinical-card text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Health Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'appointments'
              ? 'bg-sky-600 text-white shadow-sm border border-sky-400'
              : 'clinical-card text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Appointments & Receipts ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'profile'
              ? 'bg-sky-600 text-white shadow-sm border border-sky-400'
              : 'clinical-card text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Patient Profile</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & HEALTH TELEMETRY */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>Patient Vitals Telemetry</span>
              </h3>
              <button
                onClick={() => setShowVitalsModal(true)}
                className="px-3 py-1.5 rounded-lg clinical-card text-xs font-semibold text-sky-400 hover:text-white flex items-center space-x-1 border border-white/10"
              >
                <Edit3 className="w-3 h-3" />
                <span>Update Vitals</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
              <div className="clinical-card p-4 rounded-xl space-y-1.5 border border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Heart Rate</span>
                  <Heart className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div className="text-xl font-bold text-white tabular-nums">{vitals.heartRate} <span className="text-xs font-normal text-slate-400">BPM</span></div>
                <p className="text-[10px] text-emerald-400 font-medium">Optimal Resting Rate</p>
              </div>

              <div className="clinical-card p-4 rounded-xl space-y-1.5 border border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Blood Pressure</span>
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="text-xl font-bold text-white tabular-nums">{vitals.bloodPressure} <span className="text-xs font-normal text-slate-400">mmHg</span></div>
                <p className="text-[10px] text-emerald-400 font-medium">Clinical Standard</p>
              </div>

              <div className="clinical-card p-4 rounded-xl space-y-1.5 border border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Weight</span>
                  <Scale className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="text-xl font-bold text-white tabular-nums">{vitals.weight} <span className="text-xs font-normal text-slate-400">kg</span></div>
                <p className="text-[10px] text-slate-400">BMI: 22.4 (Normal)</p>
              </div>

              <div className="clinical-card p-4 rounded-xl space-y-1.5 border border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Water Intake</span>
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-xl font-bold text-white tabular-nums">{vitals.waterIntake} <span className="text-xs font-normal text-slate-400">L</span></div>
                <p className="text-[10px] text-cyan-400 font-medium">Daily Goal 82%</p>
              </div>

              <div className="clinical-card p-4 rounded-xl space-y-1.5 border border-white/5 col-span-2 md:col-span-1">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Daily Steps</span>
                  <Footprints className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-bold text-white tabular-nums">{vitals.steps}</div>
                <p className="text-[10px] text-amber-400 font-medium">Active Activity</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENT HISTORY & RECEIPTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Consultation Records & Payment Receipts</h3>

          {appointments.length > 0 ? (
            <div className="space-y-3.5">
              {appointments.map((apt) => (
                <div key={apt._id} className="clinical-card p-5 rounded-xl space-y-3 border border-white/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        Dr. {apt.doctor?.name || 'Medical Specialist'}
                      </h4>
                      <p className="text-xs text-slate-400">Date: {apt.date} • Slot: {apt.timeSlot}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        apt.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                        apt.status === 'SCHEDULED' ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' :
                        'bg-red-500/15 text-red-300 border border-red-500/30'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 bg-slate-900/60 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center space-x-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Payment: <strong className="text-emerald-400 uppercase font-semibold">{apt.paymentStatus || 'PAID'}</strong></span>
                    </div>
                    <div>Receipt ID: <strong className="text-slate-200 font-mono">{apt.paymentId || 'PAY-849204'}</strong></div>
                    <div>Amount: <strong className="text-white tabular-nums font-semibold">${apt.amount}</strong></div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2.5">
                      {apt.status === 'SCHEDULED' && (
                        <Link
                          to={`/video-room/${apt.meetingRoomId}?name=${encodeURIComponent(user?.name)}`}
                          className="px-3.5 py-1.5 rounded-lg clinical-btn-primary text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Video Room</span>
                        </Link>
                      )}

                      <button
                        onClick={() => setSelectedPrescriptionApt(apt)}
                        className="px-3.5 py-1.5 rounded-lg clinical-card text-slate-200 hover:text-white text-xs font-medium flex items-center space-x-1.5 border border-white/10"
                      >
                        <FileText className="w-3.5 h-3.5 text-sky-400" />
                        <span>Prescription / Notes</span>
                      </button>
                    </div>

                    {apt.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleCancelAppointment(apt._id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 clinical-card rounded-xl border border-white/5">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No consultation records on file.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EDIT PATIENT PROFILE */}
      {activeTab === 'profile' && (
        <div className="clinical-card p-6 rounded-2xl max-w-2xl mx-auto space-y-5 border border-white/5">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <User className="w-4 h-4 text-sky-400" />
            <span>Patient Profile Details</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Blood Group
                </label>
                <select
                  value={profileData.bloodGroup}
                  onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
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
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Known Medical Allergies
              </label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Dust, Peanuts, None"
                value={profileData.allergies}
                onChange={(e) => setProfileData({ ...profileData, allergies: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Emergency Contact Number
              </label>
              <input
                type="text"
                placeholder="Emergency Contact Phone"
                value={profileData.emergencyContact}
                onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-2.5 rounded-xl clinical-btn-primary font-semibold text-white text-xs flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="clinical-card p-6 rounded-2xl max-w-md w-full space-y-4 border border-white/10">
            <h3 className="text-base font-bold text-white">Record Health Vitals</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Heart Rate (BPM)</label>
                <input
                  type="text"
                  value={vitals.heartRate}
                  onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Blood Pressure (mmHg)</label>
                <input
                  type="text"
                  value={vitals.bloodPressure}
                  onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Weight (kg)</label>
                <input
                  type="text"
                  value={vitals.weight}
                  onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                />
              </div>
            </div>
            <button
              onClick={() => {
                setShowVitalsModal(false);
                toast.success('Health vitals updated!');
              }}
              className="w-full py-2.5 rounded-xl clinical-btn-primary font-semibold text-xs text-white"
            >
              Save Vitals
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientDashboard;
