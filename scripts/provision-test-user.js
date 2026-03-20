const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rwvvsutsuutyvmapukvm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dnZzdXRzdXV0eXZtYXB1a3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM1NzM1NSwiZXhwIjoyMDg4OTMzMzU1fQ.CgRXj0xU2eglttCX_3siYlWI0-zpYsaT9_KaY-Tf5l8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function provisionUser() {
  const userId = 'fe456375-3f97-420e-96fd-966daca19186';
  const email = 'test.admin@example.com';
  
  console.log(`Provisioning user: ${email} (${userId})`);

  // 1. Check if organization exists
  let { data: org, error: fetchError } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', 'test-restaurant')
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching organization:', fetchError.message);
    return;
  }

  if (!org) {
    console.log('Creating organization...');
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name: 'Test Restaurant',
        slug: 'test-restaurant',
        owner_user_id: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating organization:', error.message);
      return;
    }
    org = data;
    console.log('Organization created:', org.id);
  } else {
    console.log('Organization already exists:', org.id);
  }

  // 2. Create user profile
  const { error: userError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      full_name: 'Test Admin',
      email: email
    });

  if (userError) {
    console.error('Error creating user profile:', userError.message);
    return;
  }
  console.log('User profile created');

  // 3. Create membership
  const { error: membershipError } = await supabase
    .from('org_memberships')
    .upsert({
      org_id: org.id,
      user_id: userId,
      role: 'owner'
    });

  if (membershipError) {
    console.error('Error creating membership:', membershipError.message);
    return;
  }
  console.log('Membership created as admin');
}

provisionUser();
