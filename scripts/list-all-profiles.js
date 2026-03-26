const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rwvvsutsuutyvmapukvm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dnZzdXRzdXV0eXZtYXB1a3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM1NzM1NSwiZXhwIjoyMDg4OTMzMzU1fQ.CgRXj0xU2eglttCX_3siYlWI0-zpYsaT9_KaY-Tf5l8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllProfiles() {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('Error fetching profiles:', error.message);
  } else {
    console.log('Profiles:', JSON.stringify(data, null, 2));
  }
}

listAllProfiles();
