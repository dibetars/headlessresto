import { getShifts } from '@/actions/shifts';
import { getStaff } from '@/actions/staff';
import ShiftList from './components/ShiftList';
import AddShiftForm from './components/AddShiftForm';

export default async function SchedulingPage() {
  const shifts = await getShifts();
  const staff = await getStaff();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Staff Scheduling</h1>
        <p className="text-gray-500">Plan and manage shifts for your restaurant team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AddShiftForm staff={staff} />
        </div>
        <div className="lg:col-span-2">
          <ShiftList initialShifts={shifts} />
        </div>
      </div>
    </div>
  );
}
