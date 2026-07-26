import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MedAIPage from './pages/MedAIPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VideoConsultationPage from './pages/VideoConsultationPage';

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
                    <Route path="/med-ai" element={<MedAIPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
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
                  </Routes>
                </div>

                {/* Elegant Professional Medical Footer */}
                <footer className="glass-panel border-t border-slate-800 py-8 text-center text-xs text-slate-400">
                  <div className="max-w-7xl mx-auto px-4 space-y-2">
                    <p className="font-medium text-slate-300 italic text-sm">
                      "Wherever the art of Medicine is loved, there is also a love of Humanity." — Hippocrates
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                      © {new Date().getFullYear()} MediConnect Telehealth • Compassionate Care & Advanced Clinical Intelligence
                    </p>
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
