import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ShieldCheck,
  Users,
  Stethoscope,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  Activity,
  Search,
  Trash2,
  ShieldAlert
} from 'lucide-react';

const AdminDashboard = () => {
  const { user: currentAdmin } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/doctors/pending'),
        API.get('/admin/users')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (pendingRes.data.success) setPendingDoctors(pendingRes.data.doctors);
      if (usersRes.data.success) setAllUsers(usersRes.data.users);
    } catch (err) {
      console.error('Fetch admin data error:', err.message);
      toast.error('Failed to load admin management data.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (doctorId, status) => {
    try {
      const res = await API.patch(`/admin/doctors/${doctorId}/verify`, { status });
      if (res.data.success) {
        toast.success(`Doctor status updated to ${status}!`);
        fetchAdminData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating doctor verification status');
    }
  };

  const handleDeleteUser = async (userId, userEmail, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account '${userName}' (${userEmail})? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingUserId(userId);
      const res = await API.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        toast.success(`Account '${userName}' deleted successfully.`);
        fetchAdminData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user account.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = allUsers.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Super-Admin Control Banner */}
      <div className="clinical-card p-6 sm:p-7 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Super-Admin Control Center</h1>
            <p className="text-xs text-slate-400">Master operations • Platform revenue telemetry • Doctor credential verification • User governance</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-vital-pulse" />
            <span>SYSTEM SECURE • ENGINES ONLINE</span>
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-white/5 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'analytics'
              ? 'bg-sky-600 text-white shadow-sm border border-sky-400'
              : 'clinical-card text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Platform Analytics & Revenue</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'approvals'
              ? 'bg-sky-600 text-white shadow-sm border border-sky-400'
              : 'clinical-card text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Doctor Approvals ({pendingDoctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'users'
              ? 'bg-sky-600 text-white shadow-sm border border-sky-400'
              : 'clinical-card text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Accounts ({allUsers.length})</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS & STATS */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="clinical-card p-5 rounded-xl space-y-1.5 border border-white/5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-400 tracking-wider">
                <span>Total Patients</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <h3 className="text-2xl font-bold text-white tabular-nums">{stats.totalPatients}</h3>
              <p className="text-[11px] text-slate-400">Registered platform patients</p>
            </div>

            <div className="clinical-card p-5 rounded-xl space-y-1.5 border border-white/5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-400 tracking-wider">
                <span>Approved Doctors</span>
                <Stethoscope className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-400 tabular-nums">{stats.approvedDoctors}</h3>
              <p className="text-[11px] text-emerald-300 font-medium">Active practicing specialists</p>
            </div>

            <div className="clinical-card p-5 rounded-xl space-y-1.5 border border-white/5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-400 tracking-wider">
                <span>Pending Review</span>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-amber-400 tabular-nums">{stats.pendingDoctors}</h3>
              <p className="text-[11px] text-amber-300 font-medium">Requires admin verification</p>
            </div>

            <div className="clinical-card p-5 rounded-xl space-y-1.5 border border-white/5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-400 tracking-wider">
                <span>Total Volume</span>
                <DollarSign className="w-4 h-4 text-sky-400" />
              </div>
              <h3 className="text-2xl font-bold text-sky-400 tabular-nums">${stats.totalRevenue}</h3>
              <p className="text-[11px] text-slate-400">Gross consultation volume</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR APPROVAL QUEUE */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-amber-400" />
            <span>Doctor Credentials & License Verification Queue</span>
          </h3>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
            </div>
          ) : pendingDoctors.length > 0 ? (
            <div className="space-y-3.5">
              {pendingDoctors.map((doc) => (
                <div key={doc._id} className="clinical-card p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/5">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={doc.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Doc'}
                      alt={doc.user?.name}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-amber-500/40"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{doc.user?.name}</h4>
                      <p className="text-xs text-amber-300 font-medium">{doc.specialty} • {doc.qualification}</p>
                      <p className="text-xs text-slate-400 mt-0.5">License: <span className="text-slate-200 font-mono font-semibold">{doc.licenseNumber}</span> • Hospital: {doc.hospital}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => handleVerify(doc._id, 'REJECTED')}
                      className="px-3.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleVerify(doc._id, 'APPROVED')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 clinical-card rounded-xl border border-white/5">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">No pending doctor applications</h3>
              <p className="text-xs text-slate-400">All registered medical specialist credentials have been reviewed.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER ACCOUNT MANAGEMENT & DELETION */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span>User & Account Governance</span>
            </h3>

            <div className="relative max-w-sm w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="space-y-2.5">
              {filteredUsers.map((u) => (
                <div key={u._id} className="clinical-card p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/5">
                  <div className="flex items-center space-x-3">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                      alt={u.name}
                      className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-700"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-white text-xs sm:text-sm">{u.name}</h4>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          u.role === 'ADMIN' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                          u.role === 'DOCTOR' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                          'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    {u._id !== currentAdmin?._id ? (
                      <button
                        disabled={deletingUserId === u._id}
                        onClick={() => handleDeleteUser(u._id, u.email, u.name)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-600/25 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Account</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold px-2.5 py-1 bg-slate-900 rounded-lg border border-white/5">
                        Current Session
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 clinical-card rounded-xl border border-white/5">
              <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No user accounts found matching query.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
