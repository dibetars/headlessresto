'use client';

import { useState } from 'react';
import { ChevronDown, MapPin, Plus } from 'lucide-react';
import type { Location } from '@restaurantos/shared';

interface Props {
  locations: Location[];
  current: Location | null;
  onChange: (location: Location) => void;
}

export function LocationSwitcher({ locations, current, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 transition"
      >
        <MapPin size={14} className="text-brand-500" />
        <span className="max-w-[140px] truncate">{current?.name ?? 'Select location'}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[200px]">
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => { onChange(loc); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                  current?.id === loc.id ? 'text-brand-600 font-medium' : 'text-gray-700'
                }`}
              >
                <MapPin size={13} className={current?.id === loc.id ? 'text-brand-500' : 'text-gray-400'} />
                {loc.name}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-2">
                <Plus size={13} />
                Add location
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
