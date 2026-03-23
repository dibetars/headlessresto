const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rwvvsutsuutyvmapukvm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dnZzdXRzdXV0eXZtYXB1a3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM1NzM1NSwiZXhwIjoyMDg4OTMzMzU1fQ.CgRXj0xU2eglttCX_3siYlWI0-zpYsaT9_KaY-Tf5l8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ensureAuthUser() {
  const userId = 'fe456375-3f97-420e-96fd-966daca19186';
  const email = 'test.admin@example.com';
  const password = 'password123';

  console.log(`Checking auth user: ${email} (${userId})`);

  // 1. Check if user exists in auth.users
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError.message);
    return;
  }

  const existingUser = users.find(u => u.email === email || u.id === userId);

  if (existingUser) {
    console.log(`User already exists (ID: ${existingUser.id}, Email: ${existingUser.email}). Resetting password...`);
    
    // Update password and confirm email
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: password,
      email_confirm: true
    });

    if (error) {
      console.error('Error updating user:', error.message);
    } else {
      console.log('User password reset successfully');
    }
  } else {
    console.log('User not found. Creating user...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      id: userId,
      email: email,
      password: password,
      email_confirm: true
    });

    if (error) {
      console.error('Error creating user:', error.message);
    } else {
      console.log('User created successfully:', data.user.id);
    }
  }
}

ensureAuthUser();
