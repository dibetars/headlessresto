'use client';

import { useState } from 'react';
import { MenuItem } from '@/lib/types';
import { updateMenuItem } from '@/actions/menu';

interface EditMenuItemModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditMenuItemModal({ item, isOpen, onClose }: EditMenuItemModalProps) {
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    price: item.price.toString(),
    category: item.category,
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateMenuItem(item.id, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update menu item:', error);
      alert('Failed to update menu item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg p-10 bg-white rounded-[40px] shadow-2xl border border-slate-100 mx-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">
            Edit <span className="text-brand-orange underline decoration-brand-orange/20">Menu Item</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Item Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-blue/20 rounded-2xl outline-none font-bold text-slate-900 transition-all"
              placeholder="e.g. Classic Burger"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-blue/20 rounded-2xl outline-none font-bold text-slate-900 transition-all h-32 resize-none"
              placeholder="Tell us about the dish..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-blue/20 rounded-2xl outline-none font-bold text-slate-900 transition-all"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-brand-blue/20 rounded-2xl outline-none font-bold text-slate-900 transition-all appearance-none"
              >
                <option value="starters">Starters</option>
                <option value="main">Main Courses</option>
                <option value="desserts">Desserts</option>
                <option value="drinks">Drinks</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-brand-blue text-white shadow-xl shadow-brand-blue/20 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
