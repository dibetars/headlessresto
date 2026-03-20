'use client';

import React from 'react';
import { updateLeadStatus } from '@/actions/leads';

interface LeadActionsProps {
  leadId: string;
  currentStatus: string;
}

export default function LeadActions({ leadId, currentStatus }: LeadActionsProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setIsUpdating(true);
    try {
      await updateLeadStatus(leadId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select 
        disabled={isUpdating}
        value={currentStatus}
        onChange={(e) => handleStatusUpdate(e.target.value)}
        className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white transition-all outline-none focus:ring-2 focus:ring-brand-orange/20 cursor-pointer"
      >
        <option value="new">Mark New</option>
        <option value="in_progress">In Progress</option>
        <option value="resolved">Resolved</option>
      </select>
      
      {isUpdating && (
        <div className="w-4 h-4 border-2 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin"></div>
      )}
    </div>
  );
}
