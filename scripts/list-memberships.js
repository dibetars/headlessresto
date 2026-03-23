const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rwvvsutsuutyvmapukvm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dnZzdXRzdXV0eXZtYXB1a3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM1NzM1NSwiZXhwIjoyMDg4OTMzMzU1fQ.CgRXj0xU2eglttCX_3siYlWI0-zpYsaT9_KaY-Tf5l8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listMemberships() {
  const userId = 'fe456375-3f97-420e-96fd-966daca19186';
  const { data, error } = await supabase
    .from('org_memberships')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Memberships:', JSON.stringify(data, null, 2));
  }
}

listMemberships();
