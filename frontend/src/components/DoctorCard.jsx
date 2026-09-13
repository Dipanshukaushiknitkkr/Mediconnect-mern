import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Building2, Calendar, ShieldCheck, User } from 'lucide-react';

const DoctorCard = ({ doctor, onBook }) => {
  const doctorId = doctor._id || doctor.user?._id || doctor.user;

  return (
    <div className="clinical-card clinical-card-interactive rounded-2xl p-6 flex flex-col justify-between relative group overflow-hidden border border-white/5">
      
      {/* Subtle Top Right Glow */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition-all pointer-events-none" />

      <div>
        {/* Doctor Header (Clickable Link to Profile) */}
        <div className="flex items-start space-x-4 mb-4">
          <Link to={`/doctors/${doctorId}`} className="shrink-0 group-hover:scale-105 transition-transform">
            <img
              src={doctor.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Doctor'}
              alt={doctor.user?.name}
              className="w-14 h-14 rounded-xl object-cover ring-1 ring-sky-500/30 shadow-md"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 mb-1 flex-wrap gap-y-1">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {doctor.specialty}
              </span>
              <span className="flex items-center text-xs font-bold text-amber-400">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                {doctor.rating} ({doctor.reviewCount})
              </span>
            </div>
            <Link to={`/doctors/${doctorId}`} className="hover:text-sky-400 transition-colors">
              <h3 className="text-base font-bold text-white truncate">{doctor.user?.name}</h3>
            </Link>
            <p className="text-xs text-slate-400 font-medium truncate">{doctor.qualification}</p>
          </div>
        </div>

        {/* Doctor Info Pills */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-sky-400 mr-2 shrink-0" />
            <span className="truncate">{doctor.hospital}</span>
          </div>
          <div className="flex items-center text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-2 shrink-0" />
            <span>{doctor.experienceYears} Years Experience</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 mb-5 leading-relaxed">
          {doctor.bio}
        </p>
      </div>

      {/* Pricing & Actions */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Fee</span>
          <span className="text-lg font-bold text-white tabular-nums">${doctor.hourlyFee}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/doctors/${doctorId}`}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Profile
          </Link>
          <button
            onClick={() => onBook(doctor)}
            className="clinical-btn-primary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default DoctorCard;
