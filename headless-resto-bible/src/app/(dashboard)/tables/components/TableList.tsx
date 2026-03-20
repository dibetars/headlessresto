'use client';

import { deleteTable } from '@/actions/tables';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: string;
  qr_code_url: string | null;
}

interface TableListProps {
  tables: Table[];
}

export default function TableList({ tables }: TableListProps) {
  const [origin, setOrigin] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this table?')) {
      setLoading(id);
      try {
        await deleteTable(id);
      } catch (error) {
        console.error('Failed to delete table:', error);
        alert('Failed to delete table');
      } finally {
        setLoading(null);
      }
    }
  };

  return (
    <div className="mt-12">
      <div className="flex items-center space-x-4 mb-8">
        <div className="h-px flex-1 bg-slate-100"></div>
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Current Tables</h2>
        <div className="h-px flex-1 bg-slate-100"></div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => {
          const menuUrl = `${origin}/menu/${table.id}`;
          
          return (
            <div key={table.id} className="group relative bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              {/* Status Badge */}
              <div className="absolute top-8 right-8">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                  table.status === 'available' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'bg-rose-50 text-rose-600'
                }`}>
                  {table.status}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase group-hover:text-brand-blue transition-colors">
                    Table <span className="text-brand-orange">{table.table_number}</span>
                  </h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacity: {table.capacity} Persons</span>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-50 flex flex-col items-center">
                  <div className="relative group/qr">
                    <div className="absolute -inset-4 bg-brand-blue/5 rounded-[32px] scale-95 group-hover/qr:scale-100 opacity-0 group-hover/qr:opacity-100 transition-all duration-500"></div>
                    {origin && (
                      <div className="relative bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 group-hover/qr:shadow-xl transition-all duration-500">
                        <QRCodeSVG value={menuUrl} size={140} fgColor="#0F172A" />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex flex-col items-center space-y-4 w-full">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scan to Order</p>
                    <div className="flex w-full space-x-3">
                      <a 
                        href={menuUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 py-3 bg-brand-blue/5 hover:bg-brand-blue hover:text-white text-brand-blue text-[10px] font-black uppercase tracking-widest rounded-xl text-center transition-all"
                      >
                        Preview Menu
                      </a>
                      <button
                        onClick={() => handleDelete(table.id)}
                        disabled={loading === table.id}
                        className="px-4 py-3 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                      >
                        {loading === table.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
