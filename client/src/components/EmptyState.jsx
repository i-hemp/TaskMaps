import React from 'react';
import { Plus } from 'lucide-react';

const EmptyState = ({ icon: Icon, title, message, actionText, onAction }) => (
  <div className="flex flex-col items-center justify-center p-20 text-center animate-fade-in">
    <div className="w-24 h-24 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-400 mb-8 border border-indigo-500/20 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)]">
      <Icon size={48} />
    </div>
    <h3 className="text-3xl font-bold mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-400 mb-10 max-w-md mx-auto text-lg leading-relaxed">{message}</p>
    {onAction && (
      <button 
        onClick={onAction}
        className="btn-primary px-8"
      >
        <Plus size={20} />
        {actionText}
      </button>
    )}
  </div>
);

export default EmptyState;
