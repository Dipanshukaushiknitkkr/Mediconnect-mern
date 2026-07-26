import React from 'react';

const SkeletonCard = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="glass-panel p-6 rounded-3xl space-y-4 animate-pulse border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-800 rounded-lg w-3/4"></div>
              <div className="h-3 bg-slate-800/60 rounded-lg w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-slate-800/80 rounded-lg w-full"></div>
            <div className="h-3 bg-slate-800/60 rounded-lg w-5/6"></div>
          </div>
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <div className="h-5 bg-slate-800 rounded-lg w-20"></div>
            <div className="h-9 bg-slate-800 rounded-2xl w-32"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonCard;
