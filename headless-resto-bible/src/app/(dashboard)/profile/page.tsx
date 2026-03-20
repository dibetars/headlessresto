import { createClient } from '@/lib/supabase/server';
import ProfileForm from './components/ProfileForm';

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Not logged in.</div>;
  }

  const { data: profile } = await supabase
    .from('staff')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <ProfileForm user={user} profile={profile} />
    </div>
  );
}
