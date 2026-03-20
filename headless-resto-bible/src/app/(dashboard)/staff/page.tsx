import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getStaff } from '@/actions/staff';
import StaffList from './components/StaffList';
import AddStaffForm from './components/AddStaffForm';

export default async function StaffPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: staffData } = await supabase
    .from('staff')
    .select('role')
    .eq('id', user.id)
    .single();

  if (staffData?.role !== 'super_admin' && staffData?.role !== 'owner' && staffData?.role !== 'manager') {
    redirect('/dashboard');
  }

  const staff = await getStaff();

  return (
    <div>
      <h1 className="text-2xl font-bold">Staff Management</h1>
      <AddStaffForm />
      <StaffList staff={staff} />
    </div>
  );
}
