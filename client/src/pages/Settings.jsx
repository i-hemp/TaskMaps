import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050811] text-slate-200 p-8 md:p-12">
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group flex items-center gap-2"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>
      <h1 className="text-4xl font-bold mb-4">Settings</h1>
      <p className="text-slate-400">Coming soon in Phase 3...</p>
    </div>
  );
};

export default Settings;
