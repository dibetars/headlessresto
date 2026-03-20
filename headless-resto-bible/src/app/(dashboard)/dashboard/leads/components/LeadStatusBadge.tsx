import React from 'react';

interface LeadStatusBadgeProps {
  status: string;
}

export default function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-brand-orange/10 text-brand-orange border-brand-orange/20';
      case 'in_progress':
        return 'bg-brand-blue/10 text-brand-blue border-brand-blue/20';
      case 'resolved':
        return 'bg-green-50 text-green-600 border-green-100';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(status)}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
