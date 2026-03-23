const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rwvvsutsuutyvmapukvm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dnZzdXRzdXV0eXZtYXB1a3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM1NzM1NSwiZXhwIjoyMDg4OTMzMzU1fQ.CgRXj0xU2eglttCX_3siYlWI0-zpYsaT9_KaY-Tf5l8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
  const email = 'test.admin@example.com';
  
  console.log(`Checking auth user: ${email}`);

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error listing users:', error.message);
    return;
  }

  const user = data.users.find(u => u.email === email);

  if (!user) {
    console.log('User not found in auth. Creating user...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: 'password123',
      email_confirm: true
    });

    if (createError) {
      console.error('Error creating user:', createError.message);
      return;
    }
    console.log('User created successfully:', newUser.user.id);
  } else {
    console.log('User exists in auth:', user.id);
    console.log('Updating password to password123...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: 'password123'
    });
    if (updateError) {
      console.error('Error updating password:', updateError.message);
    } else {
      console.log('Password updated successfully');
    }
  }
}

checkUser();
