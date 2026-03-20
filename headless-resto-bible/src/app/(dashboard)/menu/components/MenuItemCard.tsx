'use client';

import { useState } from 'react';
import { MenuItem } from '@/lib/types';
import { deleteMenuItem } from '@/actions/menu';
import EditMenuItemModal from './EditMenuItemModal';

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      setLoading(true);
      try {
        await deleteMenuItem(item.id);
      } catch (error) {
        console.error('Failed to delete menu item:', error);
        alert('Failed to delete menu item');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-[32px] shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-blue transition-colors tracking-tight italic uppercase">
            {item.name}
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
            {item.category}
          </p>
        </div>
        <span className="text-xl font-black text-brand-orange">${Number(item.price).toFixed(2)}</span>
      </div>
      
      <p className="text-sm text-slate-600 font-medium line-clamp-2 min-h-[2.5rem] mb-6">
        {item.description}
      </p>

      <div className="flex space-x-3 pt-4 border-t border-slate-50">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
        >
          Edit Item
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? '...' : 'Delete'}
        </button>
      </div>

      <EditMenuItemModal 
        item={item} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </div>
  );
}
