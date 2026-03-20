'use client';

import { useState, useRef, useEffect } from 'react';
import { updateRestaurantStatus } from '@/actions/restaurants';

interface RestaurantActionsProps {
  id: string;
  currentStatus: string;
}

export default function RestaurantActions({ id, currentStatus }: RestaurantActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateRestaurantStatus(id, newStatus);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update restaurant status:', error);
      alert('Failed to update restaurant status');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-brand-orange p-2 transition-colors"
      >
        •••
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-100 shadow-xl z-10 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-slate-50 mb-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Status</p>
          </div>
          
          <button
            onClick={() => handleStatusUpdate('active')}
            disabled={currentStatus === 'active'}
            className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center space-x-2 ${
              currentStatus === 'active' ? 'text-slate-300 cursor-not-allowed' : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Set Active</span>
          </button>

          <button
            onClick={() => handleStatusUpdate('pending')}
            disabled={currentStatus === 'pending'}
            className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center space-x-2 ${
              currentStatus === 'pending' ? 'text-slate-300 cursor-not-allowed' : 'text-amber-600 hover:bg-amber-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Set Pending</span>
          </button>

          <button
            onClick={() => handleStatusUpdate('suspended')}
            disabled={currentStatus === 'suspended'}
            className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors flex items-center space-x-2 ${
              currentStatus === 'suspended' ? 'text-slate-300 cursor-not-allowed' : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Suspend</span>
          </button>
        </div>
      )}
    </div>
  );
}
