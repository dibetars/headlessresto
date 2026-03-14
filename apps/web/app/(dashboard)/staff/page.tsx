'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, Clock } from 'lucide-react';
import { createClient } from '../../../lib/supabase';

type Tab = 'roster' | 'schedule' | 'attendance';

export default function StaffPage() {
  const [tab, setTab] = useState<Tab>('roster');
  const [staff, setStaff] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const today = new Date().toISOString().split('T')[0];
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: m } = await supabase.from('org_memberships').select('location_id, org_id')
      .eq('user_id', session.user.id).eq('is_active', true).limit(1).single();
    const locId = m?.location_id; if (!locId) return;
    setLocationId(locId);

    const [{ data: members }, { data: scheds }, { data: logs }] = await Promise.all([
      supabase.from('org_memberships').select('*, users(id, email, full_name, phone, avatar_url)')
        .eq('location_id', locId).eq('is_active', true),
      supabase.from('staff_schedules').select('*, users(full_name)')
        .eq('location_id', locId).gte('shift_date', today).lte('shift_date', weekEnd).order('shift_date').order('start_time'),
      supabase.from('attendance_logs').select('*, users(full_name)')
        .eq('location_id', locId).gte('logged_at', `${today}T00:00:00Z`).order('logged_at', { ascending: false }),
    ]);

    setStaff(members || []);
    setSchedules(scheds || []);
    setAttendance(logs || []);
    setLoading(false);
  }

  if (loading) return <div className="text-gray-400 text-sm">Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Staff</h1>

      <div className="flex gap-1 mb-6">
        {[['roster', 'Roster', Users], ['schedule', 'Schedule', Calendar], ['attendance', 'Attendance', Clock]].map(([key, label, Icon]: any) => (
          <button key={key} onClick={() => setTab(key as Tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === key ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {tab === 'roster' && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {staff.map((member) => {
            const user = member.users as any;
            return (
              <div key={member.id} className="flex items-center gap-4 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold shrink-0">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full capitalize">
                  {member.role.replace('_', ' ')}
                </span>
              </div>
            );
          })}
          {staff.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No staff members yet.</div>}
        </div>
      )}

      {tab === 'schedule' && (
        <div className="space-y-4">
          {schedules.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No shifts scheduled for this week.</div>}
          {[...new Set(schedules.map((s) => s.shift_date))].map((date) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {schedules.filter((s) => s.shift_date === date).map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">
                        {(shift.users as any)?.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{(shift.users as any)?.full_name}</p>
                        <p className="text-xs text-gray-400 capitalize">{shift.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 font-mono">{shift.start_time.slice(0,5)}–{shift.end_time.slice(0,5)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'attendance' && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {attendance.map((log) => (
            <div key={log.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{(log.users as any)?.full_name}</p>
                <p className="text-xs text-gray-400 capitalize">{log.type.replace('_', ' ')} · {log.source}</p>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {attendance.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No attendance logs today.</div>}
        </div>
      )}
    </div>
  );
}
