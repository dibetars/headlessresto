import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect('/auth/login');
  }

  // Check if user is approved
  const { data: staffData } = await supabase
    .from('staff')
    .select('is_approved, role')
    .eq('id', userData.user.id)
    .single();

  if (!staffData?.is_approved) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600">Account Pending Approval</h1>
          <p className="mt-4 text-gray-600">Your account has been created, but it needs to be approved by a Super Admin before you can access the dashboard.</p>
          <div className="mt-6">
            <button
              onClick={async () => {
                'use server';
                const supabase = createClient();
                await supabase.auth.signOut();
                redirect('/auth/login');
              }}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={staffData.role} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
