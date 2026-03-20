const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rwvvsutsuutyvmapukvm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dnZzdXRzdXV0eXZtYXB1a3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM1NzM1NSwiZXhwIjoyMDg4OTMzMzU1fQ.CgRXj0xU2eglttCX_3siYlWI0-zpYsaT9_KaY-Tf5l8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findEnumValues() {
  console.log('--- Trying to find enum values ---');
  
  // Try to use a common query that might be exposed via RPC or just try to trigger an error that lists values
  const { data, error } = await supabase
    .from('org_memberships')
    .insert({
      org_id: '1673dc6c-e666-4c82-b588-bda43f8b18eb',
      user_id: 'fe456375-3f97-420e-96fd-966daca19186',
      role: 'INVALID_VALUE_TO_GET_ERROR_MESSAGE'
    });

  if (error) {
    console.log('Error message:', error.message);
    console.log('Error details:', error.details);
    console.log('Error hint:', error.hint);
  }
}

findEnumValues();
