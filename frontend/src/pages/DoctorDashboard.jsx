import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import PrescriptionModal from '../components/PrescriptionModal';
import { Stethoscope, Calendar, Video, FileText, UserCheck, DollarSign, Clock, Star, Edit3, Save, ShieldCheck, CheckCircle2, Plus, Trash2, XCircle } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(user?.doctorProfile || null);

  // Digital Prescription Form State
  const [selectedAptForRx, setSelectedAptForRx] = useState(null);
  const [rxForm, setRxForm] = useState({
    diagnosis: '',
    advice: '',
    medicines: [{ name: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days' }]
  });
  const [issuingRx, setIssuingRx] = useState(false);

  // Doctor Profile Form State
  const [profileData, setProfileData] = useState({
    specialty: doctorProfile?.specialty || 'Cardiology',
    qualification: doctorProfile?.qualification || 'MD',
    experienceYears: doctorProfile?.experienceYears || 5,
    hourlyFee: doctorProfile?.hourlyFee || 75,
    hospital: doctorProfile?.hospital || 'MediConnect Healthcare Center',
    bio: doctorProfile?.bio || '',
    licenseNumber: doctorProfile?.licenseNumber || 'LIC-100204'
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    fetchDoctorData();
    const interval = setInterval(fetchDoctorData, 3000);
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

  const fetchDoctorData = async () => {
    try {
      const res = await API.get('/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Fetch doctor appointments error:', err.message);
      toast.error('Could not load your appointments. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (aptId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled patient consultation?')) return;

    try {
      const res = await API.patch(`/appointments/${aptId}/status`, { status: 'CANCELLED' });
      if (res.data.success) {
        toast.info('Consultation cancelled successfully.');
        fetchDoctorData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  const handleUpdateDoctorProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const res = await API.put('/doctors/profile', profileData);
      if (res.data.success) {
        toast.success('Doctor profile & consultation fees updated!');
        if (res.data.profile) setDoctorProfile(res.data.profile);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddMedicine = () => {
    setRxForm({
      ...rxForm,
      medicines: [...rxForm.medicines, { name: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days' }]
    });
  };

  const handleRemoveMedicine = (idx) => {
    const list = [...rxForm.medicines];
    list.splice(idx, 1);
    setRxForm({ ...rxForm, medicines: list });
  };

  const handleMedicineChange = (idx, field, val) => {
    const list = [...rxForm.medicines];
    list[idx][field] = val;
    setRxForm({ ...rxForm, medicines: list });
  };

  const handleIssuePrescription = async (e) => {
    e.preventDefault();
    if (!selectedAptForRx) {
      toast.error('Please select an appointment to issue prescription.');
      return;
    }

    try {
      setIssuingRx(true);
      const res = await API.post(`/appointments/${selectedAptForRx._id}/prescription`, {
        patientId: selectedAptForRx.patient?._id || selectedAptForRx.patient,
        diagnosis: rxForm.diagnosis,
        advice: rxForm.advice,
        medicines: rxForm.medicines
      });

      if (res.data.success) {
        toast.success('Digital Prescription generated and sent to patient!');
        setSelectedAptForRx(null);
        setRxForm({
          diagnosis: '',
          advice: '',
          medicines: [{ name: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days' }]
        });
        fetchDoctorData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue prescription.');
    } finally {
      setIssuingRx(false);
    }
  };

  const totalEarnings = appointments.reduce((sum, a) => sum + (a.amount || 0), 0);
  const pendingApts = appointments.filter((a) => a.status === 'SCHEDULED');
  const activeConsultation = pendingApts[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Doctor Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border-slate-800">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-purple-500/30"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Dr. {user?.name}</h1>
              <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold ${
                doctorProfile?.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {doctorProfile?.status || 'APPROVED'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              {profileData.specialty} • {profileData.qualification} • {profileData.hospital}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-center">
          <div className="glass-panel p-3 px-5 rounded-2xl">
            <div className="text-xl font-extrabold text-emerald-400">${totalEarnings}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Total Revenue</div>
          </div>

          <div className="glass-panel p-3 px-5 rounded-2xl">
            <div className="text-xl font-extrabold text-purple-400">{appointments.length}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Consultations</div>
          </div>
        </div>
      </div>

      {/* ALWAYS VISIBLE TOP BANNER: ACTIVE PATIENT CONSULTATION READY */}
      {activeConsultation ? (
        <div className="glass-panel p-6 rounded-3xl border-2 border-purple-500/50 space-y-4 shadow-2xl bg-purple-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-purple-300">
              <span className="w-3 h-3 rounded-full bg-purple-500 animate-ping"></span>
              <span>PATIENT CONSULTATION READY TO START</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-extrabold border border-purple-500/40">
              {activeConsultation.date} • {activeConsultation.timeSlot}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div className="flex items-center space-x-4">
              <img
                src={activeConsultation.patient?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patient'}
                alt={activeConsultation.patient?.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/40"
              />
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Patient: {activeConsultation.patient?.name || 'Patient'}
                </h3>
                <p className="text-xs text-slate-300">
                  Fee Collected: <strong className="text-emerald-400">${activeConsultation.amount}</strong> • Room: {activeConsultation.meetingRoomId}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Notes: "{activeConsultation.patientNotes || 'General consultation'}"</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to={`/video-room/${activeConsultation.meetingRoomId}?name=Dr.%20${encodeURIComponent(user?.name)}`}
                className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2.5 shadow-xl hover:scale-105 transition-transform"
              >
                <Video className="w-5 h-5" />
                <span>Start Video Room</span>
              </Link>

              <button
                onClick={() => handleCancelAppointment(activeConsultation._id)}
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
            <Calendar className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-slate-300 font-semibold">No active patient bookings in queue.</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Auto-refreshing every 3s...</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'overview' ? 'bg-purple-600 text-white shadow-lg' : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Practice Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'appointments' ? 'bg-purple-600 text-white shadow-lg' : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointments Queue ({pendingApts.length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('prescription')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'prescription' ? 'bg-purple-600 text-white shadow-lg' : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Issue Digital Prescription</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'profile' ? 'bg-purple-600 text-white shadow-lg' : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile & Fees</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-3xl space-y-2 border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Completed Consultations</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {appointments.filter((a) => a.status === 'COMPLETED').length}
              </div>
              <p className="text-xs text-slate-400">Total consultations finished</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl space-y-2 border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Patient Rating</span>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">4.9 / 5.0</div>
              <p className="text-xs text-amber-400 font-semibold">Top Rated Specialist</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl space-y-2 border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>Consultation Fee</span>
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">${profileData.hourlyFee} <span className="text-xs text-slate-400 font-normal">/ session</span></div>
              <p className="text-xs text-slate-400">Current active fee</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENTS QUEUE */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-white">Patient Appointment Queue</h3>

          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt._id} className="glass-panel p-6 rounded-3xl space-y-4 border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <h4 className="font-extrabold text-white text-base">
                        Patient: {apt.patient?.name || 'Patient'}
                      </h4>
                      <p className="text-xs text-slate-400">Date: {apt.date} • Time: {apt.timeSlot} • Notes: "{apt.patientNotes || 'General consultation'}"</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                      apt.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      apt.status === 'SCHEDULED' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-3">
                      {apt.status === 'SCHEDULED' && (
                        <Link
                          to={`/video-room/${apt.meetingRoomId}?name=Dr.%20${encodeURIComponent(user?.name)}`}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-1.5"
                        >
                          <Video className="w-4 h-4" />
                          <span>Start Video Call</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setSelectedAptForRx(apt);
                          setActiveTab('prescription');
                        }}
                        className="px-4 py-2 rounded-xl glass-panel text-slate-200 hover:text-white text-xs font-bold flex items-center space-x-1.5"
                      >
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span>Issue Prescription</span>
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
              <p className="text-xs text-slate-400">No patient bookings queued.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ISSUE DIGITAL PRESCRIPTION */}
      {activeTab === 'prescription' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-3xl mx-auto space-y-6 border-slate-800">
          <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>Generate Official Digital Prescription</span>
          </h3>

          <form onSubmit={handleIssuePrescription} className="space-y-6">
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Select Patient Appointment
              </label>
              <select
                value={selectedAptForRx?._id || ''}
                onChange={(e) => {
                  const apt = appointments.find((a) => a._id === e.target.value);
                  setSelectedAptForRx(apt);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              >
                <option value="">-- Choose Patient --</option>
                {appointments.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.patient?.name} ({a.date} - {a.timeSlot})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Clinical Diagnosis
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acute Viral Upper Respiratory Tract Infection"
                value={rxForm.diagnosis}
                onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            {/* Medicines Array */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Prescribed Medications</span>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="px-3 py-1 rounded-xl bg-purple-600/20 text-purple-300 text-xs font-bold flex items-center space-x-1 hover:bg-purple-600/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              {rxForm.medicines.map((med, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-900 p-3 rounded-2xl border border-slate-800 items-center">
                  <input
                    type="text"
                    placeholder="Medicine Name (e.g. Paracetamol 500mg)"
                    value={med.name}
                    onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 1 Tablet)"
                    value={med.dosage}
                    onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      placeholder="Duration"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                    {rxForm.medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Doctor Advice & Instructions
              </label>
              <textarea
                rows={3}
                placeholder="Take with warm water after meals. Rest for 3 days..."
                value={rxForm.advice}
                onChange={(e) => setRxForm({ ...rxForm, advice: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={issuingRx}
              className="w-full py-3.5 rounded-2xl gradient-btn font-bold text-white text-xs flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>{issuingRx ? 'Generating Digital Rx...' : 'Issue & Sign Digital Prescription'}</span>
            </button>

          </form>
        </div>
      )}

      {/* TAB 4: EDIT DOCTOR PROFILE */}
      {activeTab === 'profile' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl mx-auto space-y-6 border-slate-800">
          <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-purple-400" />
            <span>Doctor Profile & Consultation Fee Settings</span>
          </h3>

          <form onSubmit={handleUpdateDoctorProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Specialty
                </label>
                <select
                  value={profileData.specialty}
                  onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General Physician">General Physician</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Qualification
                </label>
                <input
                  type="text"
                  value={profileData.qualification}
                  onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Consultation Fee ($ / Session)
                </label>
                <input
                  type="number"
                  value={profileData.hourlyFee}
                  onChange={(e) => setProfileData({ ...profileData, hourlyFee: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={profileData.experienceYears}
                  onChange={(e) => setProfileData({ ...profileData, experienceYears: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Hospital / Clinic Name
              </label>
              <input
                type="text"
                value={profileData.hospital}
                onChange={(e) => setProfileData({ ...profileData, hospital: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Professional Bio & Expertise Summary
              </label>
              <textarea
                rows={3}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-3 rounded-2xl gradient-btn font-bold text-white text-xs flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{updatingProfile ? 'Saving Changes...' : 'Save Profile & Fee Settings'}</span>
            </button>

          </form>
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;
