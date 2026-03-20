const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rwvvsutsuutyvmapukvm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dnZzdXRzdXV0eXZtYXB1a3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM1NzM1NSwiZXhwIjoyMDg4OTMzMzU1fQ.CgRXj0xU2eglttCX_3siYlWI0-zpYsaT9_KaY-Tf5l8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectSchema() {
  console.log('--- Inspecting user_role enum ---');
  const { data, error } = await supabase.rpc('inspect_enum', { enum_name: 'user_role' });
  
  if (error) {
    console.log('RPC inspect_enum failed, trying direct SQL via query...');
    // Since we don't have direct SQL access through the client, we'll try common variations 
    // or look at existing records in other tables.
    // Let's try to query the information schema if possible, although rpc is usually needed.
    
    // Alternative: Try to get one record from org_memberships to see its structure
    const { data: membership, error: memError } = await supabase.from('org_memberships').select('*').limit(1);
    if (memError) {
      console.error('Error fetching membership:', memError.message);
    } else {
      console.log('Membership structure:', membership);
    }
  } else {
    console.log('Enum values:', data);
  }
}

inspectSchema();
