import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-card animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
      <div className="w-20 h-6 bg-white/10 rounded-full"></div>
    </div>
    <div className="w-3/4 h-6 bg-white/10 rounded-lg mb-3"></div>
    <div className="w-full h-12 bg-white/10 rounded-lg mb-8"></div>
    <div className="flex justify-between items-center pt-6 border-t border-white/5">
      <div className="flex -space-x-2">
        <div className="w-8 h-8 bg-white/10 rounded-full border-2 border-[#050811]"></div>
        <div className="w-8 h-8 bg-white/10 rounded-full border-2 border-[#050811]"></div>
      </div>
      <div className="w-24 h-4 bg-white/10 rounded-full"></div>
    </div>
  </div>
);

export const TaskSkeleton = () => (
  <div className="glass-card !p-6 animate-pulse mb-4">
    <div className="w-16 h-5 bg-white/10 rounded-full mb-4"></div>
    <div className="w-full h-6 bg-white/10 rounded-lg mb-4"></div>
    <div className="flex justify-between items-center pt-4 border-t border-white/5">
      <div className="w-20 h-4 bg-white/10 rounded-full"></div>
      <div className="w-8 h-8 bg-white/10 rounded-full"></div>
    </div>
  </div>
);

export const StatSkeleton = () => (
  <div className="glass-card !p-8 animate-pulse flex items-center justify-between">
    <div className="space-y-3">
      <div className="w-24 h-4 bg-white/10 rounded-full"></div>
      <div className="w-12 h-8 bg-white/10 rounded-lg"></div>
    </div>
    <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
  </div>
);
