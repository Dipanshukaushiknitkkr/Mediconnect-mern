import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  LogOut,
  LayoutDashboard,
  Stethoscope,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
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
    <header className="sticky top-0 z-40 w-full bg-[#FBF6EF]/95 backdrop-blur-md border-b border-[#E8DFD3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#1F4D3D] text-white flex items-center justify-center shadow-sm group-hover:bg-[#15362B] transition-colors">
            <Stethoscope className="w-5 h-5 text-[#FBF6EF]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold font-serif tracking-tight text-[#1C2B24]">
              Medi<span className="text-[#1F4D3D]">Connect</span>
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-[#1F4D3D]/10 text-[#1F4D3D] font-semibold'
                : 'text-[#53655D] hover:text-[#1C2B24] hover:bg-[#1F4D3D]/5'
            }`}
          >
            Find a Doctor
          </Link>

          <Link
            to="/med-ai"
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/med-ai'
                ? 'bg-[#1F4D3D]/10 text-[#1F4D3D] font-semibold'
                : 'text-[#53655D] hover:text-[#1C2B24] hover:bg-[#1F4D3D]/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#1F4D3D]" />
            <span>AI Symptom Checker</span>
          </Link>

          {user && (
            <Link
              to={getDashboardPath()}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname.includes('dashboard') || location.pathname === '/admin'
                  ? 'bg-[#1F4D3D]/10 text-[#1F4D3D] font-semibold'
                  : 'text-[#53655D] hover:text-[#1C2B24] hover:bg-[#1F4D3D]/5'
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right User Controls */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl bg-white border border-[#E8DFD3] hover:border-[#1F4D3D]/40 transition-colors shadow-sm"
              >
                <img
                  src={user.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120`}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover bg-[#DCEAE1]"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-semibold text-xs text-[#1C2B24] leading-tight">{user.name}</span>
                  <span className="text-[11px] text-[#53655D]">
                    {user.role === 'DOCTOR' ? 'Doctor' : user.role === 'ADMIN' ? 'Admin' : 'Patient'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#53655D]" />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl p-2 shadow-xl z-50 border border-[#E8DFD3]">
                  <div className="px-3 py-2 border-b border-[#E8DFD3] mb-1">
                    <p className="text-xs font-semibold text-[#1C2B24] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#53655D] truncate">{user.email}</p>
                  </div>

                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-[#1C2B24] hover:bg-[#FBF6EF] rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#1F4D3D]" />
                    <span>My Dashboard</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-[#C4501F] hover:bg-[#C4501F]/10 rounded-xl transition-colors mt-1"
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
              className="btn-forest-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-1.5"
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
