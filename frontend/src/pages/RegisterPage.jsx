import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, Check, AlertCircle, Mail, KeyRound, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

const RegisterPage = () => {
  const { register, verifyOtp, resendOtp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Registration Form State
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

  // OTP Verification Screen State
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpPreviewCode, setOtpPreviewCode] = useState('');
  const [resending, setResending] = useState(false);

  const otpInputsRef = useRef([]);

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
      
      if (data.requiresOtp) {
        setShowOtpScreen(true);
        if (data.otpPreview) {
          setOtpPreviewCode(data.otpPreview);
        }
        toast.info('6-Digit OTP Code generated! Check your email or preview code below.');
      } else {
        toast.success(`Account created successfully as ${role}!`);
        if (role === 'DOCTOR') navigate('/doctor-dashboard');
        else navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check inputs.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // OTP Input Field Handlers
  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input box
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      otpInputsRef.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setOtpError('Please enter all 6 digits of the OTP code.');
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError('');
      const res = await verifyOtp(formData.email, fullOtp);
      toast.success('Email verified successfully! Welcome to MediConnect.');
      if (res.user?.role === 'DOCTOR') navigate('/doctor-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired 6-digit OTP code.';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResending(true);
      setOtpError('');
      const res = await resendOtp(formData.email);
      toast.success('New 6-Digit OTP sent to your email!');
      if (res.otpPreview) {
        setOtpPreviewCode(res.otpPreview);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        
        {/* OTP VERIFICATION SCREEN */}
        {showOtpScreen ? (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border-purple-500/40 shadow-2xl animate-fade-in">
            
            <button
              onClick={() => setShowOtpScreen(false)}
              className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to registration</span>
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto mb-2">
                <Mail className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Verify Your Email Address</h2>
              <p className="text-xs text-slate-400">
                We sent a 6-digit OTP code to <strong className="text-white">{formData.email}</strong>
              </p>
            </div>

            {/* Dev Mode OTP Preview Alert */}
            {otpPreviewCode && (
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center space-y-1">
                <span className="text-[11px] font-bold text-purple-300 uppercase block tracking-wider">Demo Mode OTP Verification Code</span>
                <span className="text-2xl font-extrabold text-white font-mono tracking-widest">{otpPreviewCode}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              
              {/* 6 Individual Digit Input Boxes */}
              <div className="flex justify-center space-x-2 sm:space-x-3" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl font-extrabold rounded-2xl bg-slate-900 border-2 border-slate-700 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-mono transition-all"
                  />
                ))}
              </div>

              {otpError && <p className="text-xs text-red-400 font-semibold text-center">{otpError}</p>}

              <button
                type="submit"
                disabled={otpLoading || otpDigits.join('').length !== 6}
                className="w-full py-3.5 rounded-2xl gradient-btn font-bold text-white text-sm shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <span>Verify & Activate Account</span>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-800">
              <p className="text-xs text-slate-400">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResendOtp}
                  className="text-purple-400 font-bold hover:underline inline-flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>Resend Code</span>
                </button>
              </p>
            </div>

          </div>
        ) : (
          /* INITIAL REGISTRATION FORM */
          <>
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
                  className="w-full py-3 rounded-2xl gradient-btn font-bold text-white text-sm shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating OTP Code...</span>
                    </>
                  ) : (
                    <span>{`Register & Verify Email`}</span>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-400 font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default RegisterPage;
