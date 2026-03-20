'use client';

import { useState } from 'react';
import { addShift } from '@/actions/shifts';
import { useRouter } from 'next/navigation';

export default function AddShiftForm({ staff }: { staff: any[] }) {
  const [staffId, setStaffId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await addShift({
        staff_id: staffId,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        role: role,
      });
      setStaffId('');
      setStartTime('');
      setEndTime('');
      setRole('');
      router.refresh();
    } catch (error) {
      console.error('Failed to add shift:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-6">
      <h2 className="text-lg font-bold mb-4">Add New Shift</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member</label>
          <select 
            value={staffId} 
            onChange={(e) => setStaffId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            <option value="">Select Staff</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role for Shift</label>
          <input 
            type="text" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="e.g. Server, Chef, Manager"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input 
            type="datetime-local" 
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input 
            type="datetime-local" 
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
        >
          {isLoading ? 'Adding...' : 'Add Shift'}
        </button>
      </form>
    </div>
  );
}
