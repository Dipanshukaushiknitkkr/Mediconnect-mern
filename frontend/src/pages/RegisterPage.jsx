import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, Check, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState('PATIENT');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: 'Cardiology',
    qualification: 'MD',
    experienceYears: 5,
    hourlyFee: 75,
    licenseNumber: '',
    hospital: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-800' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-yellow-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await register({ ...formData, role });
      toast.success(`Account created successfully as ${role}!`);
      if (role === 'DOCTOR') navigate('/doctor-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check inputs.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
          <p className="text-xs text-slate-400">Join MediConnect as a Patient or Healthcare Specialist</p>
        </div>

        {/* Public Role Switcher (Patient vs Doctor) */}
        <div className="flex p-1 rounded-2xl glass-panel border-slate-700">
          <button
            type="button"
            onClick={() => setRole('PATIENT')}
            className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === 'PATIENT' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Patient Account
          </button>
          <button
            type="button"
            onClick={() => setRole('DOCTOR')}
            className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === 'DOCTOR' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Doctor / Specialist
          </button>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 border-slate-700/80 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Password Strength Meter */}
            {formData.password && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium">Password Strength:</span>
                  <span className={`font-bold ${
                    strength.label === 'Strong' ? 'text-emerald-400' :
                    strength.label === 'Good' ? 'text-blue-400' :
                    strength.label === 'Fair' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{strength.label}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Doctor Specific Fields */}
            {role === 'DOCTOR' && (
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Specialty
                    </label>
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
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
                      name="qualification"
                      required
                      placeholder="e.g. MD, MBBS, MS"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Exp. (Years)
                    </label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Fee ($/session)
                    </label>
                    <input
                      type="number"
                      name="hourlyFee"
                      value={formData.hourlyFee}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      License No.
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      required
                      placeholder="LIC-123456"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl gradient-btn font-bold text-white text-sm shadow-lg disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : `Register as ${role}`}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
