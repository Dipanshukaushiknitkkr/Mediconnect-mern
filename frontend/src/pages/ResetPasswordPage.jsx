import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { KeyRound, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const toast = useToast();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await API.post('/auth/reset-password', { token, newPassword });
      if (res.data.success) {
        toast.success('Password updated successfully! Please log in.');
        navigate('/login');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. Link may be expired.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-xl mb-2">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Set New Password</h2>
          <p className="text-xs text-slate-400">Choose a strong new password for your account</p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5 border-slate-700/80 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                New Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl gradient-btn font-bold text-white text-sm shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ResetPasswordPage;
