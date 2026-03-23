const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rwvvsutsuutyvmapukvm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dnZzdXRzdXV0eXZtYXB1a3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM1NzM1NSwiZXhwIjoyMDg4OTMzMzU1fQ.CgRXj0xU2eglttCX_3siYlWI0-zpYsaT9_KaY-Tf5l8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyPassword() {
  const email = 'fabrice@dimaxdigital.com';
  const passwords = ['password123', 'Password123!', '12345678', 'admin123'];

  for (const password of passwords) {
    console.log(`Trying password: ${password}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Failed for ${password}: ${error.message}`);
    } else {
      console.log(`SUCCESS! Password for ${email} is: ${password}`);
      return;
    }
  }
}

verifyPassword();
