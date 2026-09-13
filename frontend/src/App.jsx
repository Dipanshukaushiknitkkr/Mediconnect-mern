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
              <div className="min-h-screen bg-[#FBF6EF] text-[#1C2B24] flex flex-col justify-between transition-colors">
                
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
                <footer className="bg-white border-t border-[#E8DFD3] pt-12 pb-8 text-xs text-[#53655D] mt-16">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                    
                    {/* Main Footer Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                      
                      {/* Col 1: Brand & Overview (2 cols on lg) */}
                      <div className="lg:col-span-2 space-y-4">
                        <Link to="/" className="flex items-center space-x-2.5">
                          <div className="p-1.5 rounded-lg bg-[#1F4D3D] text-white shadow-sm">
                            <Stethoscope className="w-4 h-4" />
                          </div>
                          <span className="text-base font-bold font-serif text-[#1C2B24] tracking-tight">
                            Medi<span className="text-[#1F4D3D]">Connect</span>
                          </span>
                        </Link>

                        <p className="text-xs text-[#53655D] leading-relaxed max-w-sm">
                          Encrypted WebRTC telehealth platform combining AI symptom triage, verified physician consultations, and digital prescription management.
                        </p>

                        <div className="flex items-center space-x-2 pt-1 text-xs text-[#1F4D3D] font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#1F4D3D] animate-vital-pulse" />
                          <span>Systems Operational • 256-Bit Encrypted Media</span>
                        </div>
                      </div>

                      {/* Col 2: Patient Care */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-[#1C2B24] uppercase tracking-wider">Patient Care</h4>
                        <ul className="space-y-2 text-xs">
                          <li>
                            <Link to="/" className="text-[#53655D] hover:text-[#1F4D3D] transition-colors">Find a Doctor</Link>
                          </li>
                          <li>
                            <Link to="/med-ai" className="text-[#53655D] hover:text-[#1F4D3D] transition-colors">AI Symptom Triage</Link>
                          </li>
                          <li>
                            <Link to="/how-it-works" className="text-[#53655D] hover:text-[#1F4D3D] transition-colors">How It Works</Link>
                          </li>
                          <li>
                            <Link to="/login" className="text-[#53655D] hover:text-[#1F4D3D] transition-colors">Patient Portal</Link>
                          </li>
                        </ul>
                      </div>

                      {/* Col 3: Company & Project */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-[#1C2B24] uppercase tracking-wider">Platform & Code</h4>
                        <ul className="space-y-2 text-xs">
                          <li>
                            <Link to="/about" className="text-[#53655D] hover:text-[#1F4D3D] transition-colors">About MediConnect</Link>
                          </li>
                          <li>
                            <Link to="/contact" className="text-[#53655D] hover:text-[#1F4D3D] transition-colors">Contact & Support</Link>
                          </li>
                          <li>
                            <Link to="/register" className="text-[#53655D] hover:text-[#1F4D3D] transition-colors">Physician Registration</Link>
                          </li>
                          <li>
                            <a
                              href="https://github.com/Dipanshukaushiknitkkr/Mediconnect-mern"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#53655D] hover:text-[#1F4D3D] transition-colors inline-flex items-center space-x-1"
                            >
                              <span>GitHub Repository</span>
                            </a>
                          </li>
                        </ul>
                      </div>

                      {/* Col 4: Trust & Legal */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-[#1C2B24] uppercase tracking-wider">Trust & Legal</h4>
                        <ul className="space-y-2 text-xs">
                          <li>
                            <Link to="/privacy" className="text-[#53655D] hover:text-[#1F4D3D] transition-colors">Privacy Policy</Link>
                          </li>
                          <li>
                            <Link to="/terms" className="text-[#53655D] hover:text-[#1F4D3D] transition-colors">Terms of Service</Link>
                          </li>
                          <li>
                            <span className="text-[#7B8D85] block">Demonstration Sandbox</span>
                          </li>
                        </ul>
                      </div>

                    </div>

                    {/* Medical Emergency Disclaimer Banner */}
                    <div className="p-4 rounded-xl bg-[#FBF6EF] border border-[#E8DFD3] text-xs text-[#53655D] flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                      <p>
                        <strong className="text-[#1C2B24]">Medical Emergency:</strong> If you are experiencing an acute medical emergency, please call <strong className="text-[#C4501F]">911</strong> (or your local emergency number) immediately.
                      </p>
                      <span className="text-[11px] text-[#7B8D85] shrink-0">Open Source Healthcare Engineering</span>
                    </div>

                    {/* Bottom Copyright & Citation */}
                    <div className="pt-4 border-t border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7B8D85] gap-2">
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
