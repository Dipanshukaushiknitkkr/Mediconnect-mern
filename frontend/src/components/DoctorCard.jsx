import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Video, Phone, MessageSquare, Building2, Clock } from 'lucide-react';

const DoctorCard = ({ doctor, onBook }) => {
  const doctorId = doctor._id || doctor.user?._id || doctor.user;
  const doctorName = doctor.user?.name || doctor.name || 'Doctor';
  
  // High-res medical portrait fallback if avatar is not provided or is generic
  const avatarUrl = doctor.user?.avatar || doctor.avatar || (
    doctor.specialty === 'Cardiology' ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300' :
    doctor.specialty === 'Neurology' ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300' :
    doctor.specialty === 'Dermatology' ? 'https://images.unsplash.com/photo-1594824813588-44643037197f?auto=format&fit=crop&q=80&w=300' :
    doctor.specialty === 'Pediatrics' ? 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300' :
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
  );

  // Single Next Availability indicator (supports prop with fallback)
  const nextAvailable = doctor.nextAvailable || 'Available in 15 min';
  const isImmediate = nextAvailable.toLowerCase().includes('15 min') || nextAvailable.toLowerCase().includes('now');

  // Available consultation types (defaults to video, audio, chat)
  const consultTypes = doctor.consultTypes || ['video', 'audio', 'chat'];

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col justify-between border border-[#E8DFD3] hover:border-[#1F4D3D]/30 transition-all duration-200 shadow-sm hover:shadow-md">
      
      <div>
        {/* Header: Photo + Single Status & Specialty */}
        <div className="flex items-start space-x-4 mb-4">
          <Link to={`/doctors/${doctorId}`} className="shrink-0 relative group">
            <img
              src={avatarUrl}
              alt={doctorName}
              className="w-16 h-16 rounded-xl object-cover border border-[#E8DFD3] group-hover:scale-105 transition-transform"
            />
          </Link>

          <div className="flex-1 min-w-0">
            {/* Exactly ONE Status Indicator */}
            <div className="flex items-center space-x-1.5 mb-1.5">
              <span className={`inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                isImmediate
                  ? 'bg-[#DCEAE1] text-[#1F4D3D]'
                  : 'bg-[#F2E9DA] text-[#53655D]'
              }`}>
                {isImmediate && <span className="w-1.5 h-1.5 rounded-full bg-[#1F4D3D] animate-vital-pulse" />}
                <span>{nextAvailable}</span>
              </span>
            </div>

            <Link to={`/doctors/${doctorId}`} className="hover:text-[#1F4D3D] transition-colors">
              <h3 className="text-base font-bold text-[#1C2B24] truncate">{doctorName}</h3>
            </Link>
            <p className="text-xs text-[#53655D] font-medium truncate">{doctor.specialty} • {doctor.qualification}</p>
          </div>
        </div>

        {/* Clinical Info & Rating */}
        <div className="flex items-center justify-between text-xs text-[#53655D] py-2 border-y border-[#E8DFD3]/60 mb-3">
          <div className="flex items-center space-x-1">
            <Building2 className="w-3.5 h-3.5 text-[#1F4D3D] shrink-0" />
            <span className="truncate max-w-[140px]">{doctor.hospital || 'Medical Center'}</span>
          </div>
          <div className="flex items-center space-x-1 font-semibold text-[#1C2B24]">
            <Star className="w-3.5 h-3.5 fill-[#C4501F] text-[#C4501F]" />
            <span>{doctor.rating || '4.9'}</span>
            <span className="text-[#7B8D85] font-normal">({doctor.reviewCount || 34})</span>
          </div>
        </div>

        <p className="text-xs text-[#53655D] line-clamp-2 mb-4 leading-relaxed">
          {doctor.bio || 'Board-certified medical specialist dedicated to evidence-based telehealth consultations.'}
        </p>
      </div>

      {/* Footer: Fee, Consult Type Icons & Book Button */}
      <div className="pt-3 border-t border-[#E8DFD3] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#7B8D85] block tracking-wider">Fee</span>
          <span className="text-lg font-bold text-[#1C2B24] tabular-nums">${doctor.hourlyFee || 85}</span>
        </div>

        {/* Consult Type Indicators */}
        <div className="flex items-center space-x-1.5 text-[#53655D]" title="Available consult types">
          {consultTypes.includes('video') && (
            <div className="p-1.5 rounded-lg bg-[#FBF6EF] border border-[#E8DFD3]" title="Video Visit">
              <Video className="w-3.5 h-3.5 text-[#1F4D3D]" />
            </div>
          )}
          {consultTypes.includes('audio') && (
            <div className="p-1.5 rounded-lg bg-[#FBF6EF] border border-[#E8DFD3]" title="Phone Visit">
              <Phone className="w-3.5 h-3.5 text-[#53655D]" />
            </div>
          )}
          {consultTypes.includes('chat') && (
            <div className="p-1.5 rounded-lg bg-[#FBF6EF] border border-[#E8DFD3]" title="Chat Message">
              <MessageSquare className="w-3.5 h-3.5 text-[#53655D]" />
            </div>
          )}
        </div>

        {/* Single Prominent Booking Button */}
        <button
          onClick={() => onBook(doctor)}
          className="btn-cta-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
        >
          <span>Book video visit</span>
        </button>
      </div>

    </div>
  );
};

export default DoctorCard;
