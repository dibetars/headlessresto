'use client';

import { deleteShift } from '@/actions/shifts';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ShiftList({ initialShifts }: { initialShifts: any[] }) {
  const [shifts, setShifts] = useState(initialShifts);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;
    try {
      await deleteShift(id);
      setShifts(prev => prev.filter(s => s.id !== id));
      router.refresh();
    } catch (error) {
      console.error('Failed to delete shift:', error);
    }
  };

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (shifts.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
        <div className="text-4xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-gray-900">No shifts scheduled</h3>
        <p className="text-gray-500">Plan your team's schedule here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {shifts.map((shift) => (
            <tr key={shift.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{shift.staff?.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase tracking-wider">
                  {shift.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDateTime(shift.start_time)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDateTime(shift.end_time)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  onClick={() => handleDelete(shift.id)}
                  className="text-red-600 hover:text-red-900 transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
