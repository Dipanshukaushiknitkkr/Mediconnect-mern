import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Stethoscope, Sparkles, User, LogOut, Sun, Moon, LayoutDashboard, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="p-2 rounded-xl gradient-bg text-white shadow-lg group-hover:scale-105 transition-transform duration-200">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white">Medi<span className="gradient-text">Connect</span></span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Telehealth</span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">
            Doctors Directory
          </Link>
          <Link
            to="/med-ai"
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Med AI</span>
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Mobile Med AI Nav Shortcut */}
          <Link
            to="/med-ai"
            className="md:hidden flex items-center space-x-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Med AI</span>
          </Link>

          {/* Dark / Light Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark and Light Theme"
            className="p-2 rounded-xl glass-panel text-slate-300 hover:text-white transition-colors border border-slate-700/80"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/50"
                />
                <span className="hidden md:inline-block font-medium text-xs text-slate-200">{user.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  user.role === 'DOCTOR' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {user.role}
                </span>
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 shadow-2xl z-50 border border-slate-700/80">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Signed in as</p>
                    <p className="text-xs font-semibold text-white truncate">{user.email}</p>
                  </div>

                  <Link
                    to={user.role === 'ADMIN' ? '/admin' : user.role === 'DOCTOR' ? '/doctor-dashboard' : '/dashboard'}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-400" />
                    <span>Dashboard</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Single Unified Auth Action Button */
            <Link
              to="/login"
              className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg flex items-center space-x-1.5 hover:scale-105 transition-transform"
            >
              <span>Sign In / Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
