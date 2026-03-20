import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ title, description, icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-5xl mb-8 shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight mb-3">
        {title}
      </h3>
      <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="px-8 py-4 bg-brand-orange text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 shadow-xl shadow-brand-orange/20 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
