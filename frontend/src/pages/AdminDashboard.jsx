import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, Users, Stethoscope, DollarSign, Calendar, CheckCircle2, XCircle, Loader2, Activity, Search, Edit3, UserCheck, ShieldAlert } from 'lucide-react';

const AdminDashboard = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState(null);

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

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingRoleUserId(userId);
      const res = await API.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        toast.success(`User role updated to ${newRole}!`);
        fetchAdminData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setUpdatingRoleUserId(null);
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
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Super-Admin Control Center</h1>
            <p className="text-xs sm:text-sm text-slate-400">Master management • Revenue analytics • Doctor licensing verification • User directory</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/30">
            SYSTEM ACTIVE • ALL ENGINES ONLINE
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'analytics' ? 'bg-red-600 text-white shadow-lg' : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Platform Analytics & Revenue</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'approvals' ? 'bg-red-600 text-white shadow-lg' : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor Verification Queue ({pendingDoctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'users' ? 'bg-red-600 text-white shadow-lg' : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({allUsers.length})</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS & STATS */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-3xl space-y-2 border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
                <span>Total Patients</span>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-3xl font-extrabold text-white">{stats.totalPatients}</h3>
              <p className="text-[11px] text-slate-400">Registered platform patients</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl space-y-2 border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
                <span>Approved Doctors</span>
                <Stethoscope className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-3xl font-extrabold text-emerald-400">{stats.approvedDoctors}</h3>
              <p className="text-[11px] text-emerald-300 font-semibold">Active practicing specialists</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl space-y-2 border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
                <span>Pending License Review</span>
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-3xl font-extrabold text-amber-400">{stats.pendingDoctors}</h3>
              <p className="text-[11px] text-amber-300 font-semibold">Requires admin verification</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl space-y-2 border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
                <span>Total Platform Revenue</span>
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-3xl font-extrabold text-purple-400">${stats.totalRevenue}</h3>
              <p className="text-[11px] text-slate-400">Gross consultation volume</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR APPROVAL QUEUE */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-amber-400" />
            <span>Doctor Credentials & License Verification Queue</span>
          </h3>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            </div>
          ) : pendingDoctors.length > 0 ? (
            <div className="space-y-4">
              {pendingDoctors.map((doc) => (
                <div key={doc._id} className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-slate-800">
                  <div className="flex items-center space-x-4">
                    <img
                      src={doc.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Doc'}
                      alt={doc.user?.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/40"
                    />
                    <div>
                      <h4 className="font-bold text-white text-base">{doc.user?.name}</h4>
                      <p className="text-xs text-amber-300 font-medium">{doc.specialty} • {doc.qualification}</p>
                      <p className="text-xs text-slate-400 mt-1">License No: <span className="text-slate-200 font-mono font-bold">{doc.licenseNumber}</span> • Hospital: {doc.hospital}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleVerify(doc._id, 'REJECTED')}
                      className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Application</span>
                    </button>

                    <button
                      onClick={() => handleVerify(doc._id, 'APPROVED')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Credentials</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-panel rounded-3xl border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No pending doctor applications</h3>
              <p className="text-xs text-slate-400">All registered medical specialists have been reviewed and approved.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER DIRECTORY & ROLE PROMOTION */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>User Directory & Permission Roles</span>
            </h3>

            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="space-y-3">
              {filteredUsers.map((u) => (
                <div key={u._id} className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-800">
                  <div className="flex items-center space-x-3">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                      alt={u.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{u.name}</h4>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      u.role === 'DOCTOR' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {u.role}
                    </span>

                    <select
                      value={u.role}
                      disabled={updatingRoleUserId === u._id}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                    >
                      <option value="PATIENT">PATIENT</option>
                      <option value="DOCTOR">DOCTOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-panel rounded-3xl border-slate-800">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No users found matching your search.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
