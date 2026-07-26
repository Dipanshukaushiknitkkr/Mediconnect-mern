import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ShieldCheck, Users, Stethoscope, DollarSign, Calendar, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/doctors/pending')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (pendingRes.data.success) setPendingDoctors(pendingRes.data.doctors);
    } catch (err) {
      console.error('Fetch admin data error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (doctorId, status) => {
    try {
      const res = await API.patch(`/admin/doctors/${doctorId}/verify`, { status });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert('Error updating doctor verification status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">System Admin Control Center</h1>
            <p className="text-xs text-slate-400">Platform metrics, doctor credential verification, & revenue logs</p>
          </div>
        </div>
      </div>

      {/* Platform Stats Row */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-3xl">
            <p className="text-xs font-bold uppercase text-slate-400">Total Patients</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{stats.totalPatients}</h3>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <p className="text-xs font-bold uppercase text-slate-400">Approved Doctors</p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{stats.approvedDoctors}</h3>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <p className="text-xs font-bold uppercase text-slate-400">Pending Verification</p>
            <h3 className="text-3xl font-extrabold text-amber-400 mt-1">{stats.pendingDoctors}</h3>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <p className="text-xs font-bold uppercase text-slate-400">Total Revenue</p>
            <h3 className="text-3xl font-extrabold text-purple-400 mt-1">${stats.totalRevenue}</h3>
          </div>
        </div>
      )}

      {/* Doctor Verification Queue */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Stethoscope className="w-5 h-5 text-amber-400" />
          <span>Pending Doctor Approvals ({pendingDoctors.length})</span>
        </h2>

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
                    src={doc.user?.avatar}
                    alt={doc.user?.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/40"
                  />
                  <div>
                    <h4 className="font-bold text-white text-base">{doc.user?.name}</h4>
                    <p className="text-xs text-amber-300 font-medium">{doc.specialty} • {doc.qualification}</p>
                    <p className="text-xs text-slate-400 mt-1">License: <span className="text-slate-200 font-mono">{doc.licenseNumber}</span> • Hospital: {doc.hospital}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleVerify(doc._id, 'REJECTED')}
                    className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold flex items-center space-x-1 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleVerify(doc._id, 'APPROVED')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1 transition-colors shadow"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Credentials</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-panel rounded-3xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No pending doctor applications</h3>
            <p className="text-xs text-slate-400">All registered doctors have been verified.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
