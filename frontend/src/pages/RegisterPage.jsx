import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, Check, AlertCircle, Eye, EyeOff, Stethoscope, User } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
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
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-sky-500' };
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
      await register({ ...formData, role });
      toast.success(`Account created successfully as ${role}!`);
      if (role === 'DOCTOR') navigate('/doctor-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please verify inputs.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Create MediConnect Account</h2>
          <p className="text-xs text-slate-400">Join as a Patient or Accredited Medical Specialist</p>
        </div>

        {/* Role Switcher Pill */}
        <div className="flex p-1 rounded-xl clinical-card border border-white/10">
          <button
            type="button"
            onClick={() => setRole('PATIENT')}
            className={`w-1/2 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              role === 'PATIENT' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient Account</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('DOCTOR')}
            className={`w-1/2 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              role === 'DOCTOR' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor / Specialist</span>
          </button>
        </div>

        <div className="clinical-card p-6 sm:p-7 rounded-2xl space-y-4 border border-white/5 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Dr. John Doe or Jane Smith"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-3.5 pr-9 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-500 hover:text-slate-300 focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            {formData.password && (
              <div className="space-y-1 pt-0.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium">Strength:</span>
                  <span className={`font-semibold ${
                    strength.label === 'Strong' ? 'text-emerald-400' :
                    strength.label === 'Good' ? 'text-sky-400' :
                    strength.label === 'Fair' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{strength.label}</span>
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}

            {/* Doctor Specific Fields */}
            {role === 'DOCTOR' && (
              <div className="space-y-3.5 pt-2.5 border-t border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Specialty
                    </label>
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Qualification
                    </label>
                    <input
                      type="text"
                      name="qualification"
                      required
                      placeholder="e.g. MD, MBBS, MS"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Exp. (Yrs)
                    </label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Fee ($/session)
                    </label>
                    <input
                      type="number"
                      name="hourlyFee"
                      value={formData.hourlyFee}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      License No.
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      required
                      placeholder="LIC-100204"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl clinical-btn-primary font-semibold text-white text-xs sm:text-sm shadow-md disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : `Register as ${role === 'DOCTOR' ? 'Physician' : 'Patient'}`}
            </button>
          </form>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Already have an account?</span>
            <Link to="/login" className="text-sky-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
