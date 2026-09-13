import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Activity,
  Sparkles,
  User,
  LogOut,
  Sun,
  Moon,
  LayoutDashboard,
  ShieldCheck,
  Stethoscope,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'DOCTOR') return '/doctor-dashboard';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full clinical-card border-b border-white/5 dark:border-white/5 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Clinical Status */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-bold tracking-tight text-white">
                  Medi<span className="text-sky-400">Connect</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Telehealth
                </span>
              </div>
            </div>
          </Link>

          {/* Operational Health Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-vital-pulse" />
            <span>Online • Consultations Open</span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              location.pathname === '/'
                ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Find a Doctor
          </Link>

          <Link
            to="/med-ai"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              location.pathname === '/med-ai'
                ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-sky-300 hover:bg-sky-500/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>AI Symptom Checker</span>
          </Link>

          {user && (
            <Link
              to={getDashboardPath()}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname.includes('dashboard') || location.pathname === '/admin'
                  ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Controls & User Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl clinical-card text-slate-300 hover:text-white transition-colors border border-white/10"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-500" />}
          </button>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2.5 p-1.5 rounded-xl clinical-card border border-white/10 hover:border-sky-500/30 transition-all"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-sky-500/30"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-semibold text-xs text-white leading-tight">{user.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {user.role === 'DOCTOR' ? 'Doctor' : user.role === 'ADMIN' ? 'Administrator' : 'Patient'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 clinical-card rounded-2xl p-2 shadow-2xl z-50 border border-white/10 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Account Active</p>
                    <p className="text-xs font-semibold text-white truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center space-x-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        user.role === 'ADMIN' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                        user.role === 'DOCTOR' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                      }`}>
                        {user.role}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center">
                        <ShieldCheck className="w-3 h-3 text-emerald-400 mr-1" />
                        Secure
                      </span>
                    </div>
                  </div>

                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-400" />
                    <span>My Dashboard</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="clinical-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            >
              <span>Sign In</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
