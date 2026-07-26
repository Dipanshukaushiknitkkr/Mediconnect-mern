import React from 'react';
import { Star, Building2, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';

const DoctorCard = ({ doctor, onBook }) => {
  return (
    <div className="glass-panel rounded-3xl p-6 glass-panel-hover flex flex-col justify-between relative group overflow-hidden">
      
      {/* Top Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>

      <div>
        {/* Doctor Header */}
        <div className="flex items-start space-x-4 mb-4">
          <img
            src={doctor.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Doctor'}
            alt={doctor.user?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/40 shadow-md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {doctor.specialty}
              </span>
              <span className="flex items-center text-xs font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                {doctor.rating} ({doctor.reviewCount})
              </span>
            </div>
            <h3 className="text-lg font-bold text-white truncate">{doctor.user?.name}</h3>
            <p className="text-xs text-slate-400 font-medium truncate">{doctor.qualification}</p>
          </div>
        </div>

        {/* Doctor Info Pills */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-xs text-slate-300">
            <Building2 className="w-4 h-4 text-purple-400 mr-2 shrink-0" />
            <span className="truncate">{doctor.hospital}</span>
          </div>
          <div className="flex items-center text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
            <span>{doctor.experienceYears} Years Clinical Experience</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 mb-6 leading-relaxed">
          {doctor.bio}
        </p>
      </div>

      {/* Pricing & Booking Action */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation Fee</span>
          <span className="text-xl font-extrabold text-white">${doctor.hourlyFee}</span>
        </div>

        <button
          onClick={() => onBook(doctor)}
          className="gradient-btn px-4 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center space-x-2 shadow-lg hover:scale-105 transition-transform"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

    </div>
  );
};

export default DoctorCard;
