import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Stethoscope, KeyRound, Mail } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectByRole = (userRole) => {
    if (userRole === 'ADMIN') navigate('/admin');
    else if (userRole === 'DOCTOR') navigate('/doctor-dashboard');
    else navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const data = await login(email, password);
      toast.success('Logged in successfully!');
      redirectByRole(data.user?.role || data.role);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl gradient-bg text-white shadow-xl mb-2">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to manage appointments & telehealth consultations</p>
        </div>

        {/* Clean Professional Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5 border-slate-700/80 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl gradient-btn font-bold text-white text-sm shadow-lg disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
