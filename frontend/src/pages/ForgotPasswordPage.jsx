import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowLeft, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';

const ForgotPasswordPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccess(true);
        if (res.data.resetToken) {
          setResetToken(res.data.resetToken);
        }
        toast.success('Password reset link generated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request password reset.');
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
          <div className="inline-flex p-3.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-xl mb-2">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Forgot Password?</h2>
          <p className="text-xs text-slate-400">Enter your account email address to reset your password</p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5 border-slate-700/80 shadow-2xl">
          {success ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">Reset Link Ready</h3>
              <p className="text-xs text-slate-400">
                A password reset token has been generated for <strong className="text-white">{email}</strong>.
              </p>

              {resetToken && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3">
                  <p className="text-[11px] text-slate-400 font-medium">Click below to reset your password now:</p>
                  <button
                    onClick={() => navigate(`/reset-password?token=${resetToken}`)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow"
                  >
                    Proceed to Reset Password
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl gradient-btn font-bold text-white text-sm shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
