import React from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  ArrowLeft,
  Home,
  Search,
  Sparkles,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const NotFoundPage = () => {
  usePageMeta('Page Not Found (404)', 'The requested telehealth page could not be found.');
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Visual 404 Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-600/20 to-teal-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-2xl">
            <Stethoscope className="w-12 h-12" />
          </div>
          <span className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            The medical consultation page or resource you are looking for does not exist or may have been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto clinical-btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            to="/med-ai"
            className="w-full sm:w-auto clinical-card px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white border border-white/10 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Check Symptoms</span>
          </Link>
        </div>

        {/* Helpful Links Box */}
        <div className="clinical-card p-4 rounded-xl border border-white/5 space-y-2 text-left text-xs text-slate-400">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Quick Navigation</span>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/" className="text-sky-400 hover:underline flex items-center space-x-1">
              <span>• Find a Doctor</span>
            </Link>
            <Link to="/how-it-works" className="text-sky-400 hover:underline flex items-center space-x-1">
              <span>• How It Works</span>
            </Link>
            <Link to="/about" className="text-sky-400 hover:underline flex items-center space-x-1">
              <span>• About MediConnect</span>
            </Link>
            <Link to="/contact" className="text-sky-400 hover:underline flex items-center space-x-1">
              <span>• Contact Support</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;
