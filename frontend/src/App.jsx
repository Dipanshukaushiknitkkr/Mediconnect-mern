import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MedAIPage from './pages/MedAIPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VideoConsultationPage from './pages/VideoConsultationPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

import { Stethoscope, ShieldCheck, Lock, HeartPulse, Video, FileText, ArrowRight } from 'lucide-react';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <Router>
              <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between transition-colors">
                
                <div>
                  <Navbar />

                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/doctors/:id" element={<DoctorProfilePage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />

                    <Route path="/med-ai" element={<MedAIPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['PATIENT']}>
                          <PatientDashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/doctor-dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['DOCTOR']}>
                          <DoctorDashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/video-room/:roomId"
                      element={
                        <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
                          <VideoConsultationPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch-all 404 Route */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </div>

                {/* Expanded Multi-Column Healthcare Trust Footer */}
                <footer className="glass-panel border-t border-slate-800/80 pt-12 pb-8 text-xs text-slate-400 mt-16">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                    
                    {/* Main Footer Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                      
                      {/* Col 1: Brand & Overview (2 cols on lg) */}
                      <div className="lg:col-span-2 space-y-4">
                        <Link to="/" className="flex items-center space-x-2.5">
                          <div className="p-1.5 rounded-lg bg-sky-600 text-white shadow-sm">
                            <Stethoscope className="w-4 h-4" />
                          </div>
                          <span className="text-base font-bold text-white tracking-tight">
                            Medi<span className="text-sky-400">Connect</span>
                          </span>
                        </Link>

                        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                          Encrypted WebRTC telehealth platform combining AI symptom triage, verified physician consultations, and digital prescription management.
                        </p>

                        <div className="flex items-center space-x-2 pt-1 text-[11px] text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-vital-pulse" />
                          <span>Systems Operational • 256-Bit Encrypted Media</span>
                        </div>
                      </div>

                      {/* Col 2: Patient Care */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Patient Care</h4>
                        <ul className="space-y-2 text-xs">
                          <li>
                            <Link to="/" className="hover:text-white transition-colors">Find a Doctor</Link>
                          </li>
                          <li>
                            <Link to="/med-ai" className="hover:text-white transition-colors">AI Symptom Triage</Link>
                          </li>
                          <li>
                            <Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
                          </li>
                          <li>
                            <Link to="/login" className="hover:text-white transition-colors">Patient Portal</Link>
                          </li>
                        </ul>
                      </div>

                      {/* Col 3: Company & Project */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Platform & Code</h4>
                        <ul className="space-y-2 text-xs">
                          <li>
                            <Link to="/about" className="hover:text-white transition-colors">About MediConnect</Link>
                          </li>
                          <li>
                            <Link to="/contact" className="hover:text-white transition-colors">Contact & Support</Link>
                          </li>
                          <li>
                            <Link to="/register" className="hover:text-white transition-colors">Physician Registration</Link>
                          </li>
                          <li>
                            <a
                              href="https://github.com/Dipanshukaushiknitkkr/Mediconnect-mern"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-white transition-colors inline-flex items-center space-x-1"
                            >
                              <span>GitHub Repository</span>
                            </a>
                          </li>
                        </ul>
                      </div>

                      {/* Col 4: Trust & Legal */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Trust & Legal</h4>
                        <ul className="space-y-2 text-xs">
                          <li>
                            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                          </li>
                          <li>
                            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                          </li>
                          <li>
                            <span className="text-slate-500 block">Demonstration Sandbox</span>
                          </li>
                        </ul>
                      </div>

                    </div>

                    {/* Medical Emergency Disclaimer Banner */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                      <p>
                        <strong className="text-slate-300">Medical Emergency:</strong> If you are experiencing an acute medical emergency, please call <strong className="text-red-400">911</strong> (or your local emergency number) immediately.
                      </p>
                      <span className="text-[10px] text-slate-500 shrink-0">Open Source Healthcare Engineering</span>
                    </div>

                    {/* Bottom Copyright & Citation */}
                    <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
                      <p>© {new Date().getFullYear()} MediConnect Telehealth • Virtual Doctor Visits & Digital Prescriptions</p>
                      <p className="italic">"Wherever the art of Medicine is loved, there is also a love of Humanity." — Hippocrates</p>
                    </div>

                  </div>
                </footer>

              </div>
            </Router>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
