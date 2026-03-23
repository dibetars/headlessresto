const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rwvvsutsuutyvmapukvm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dnZzdXRzdXV0eXZtYXB1a3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM1NzM1NSwiZXhwIjoyMDg4OTMzMzU1fQ.CgRXj0xU2eglttCX_3siYlWI0-zpYsaT9_KaY-Tf5l8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLS() {
  const { data, error } = await supabase
    .rpc('get_policies', { table_name: 'org_memberships' }); // This might not work if the RPC doesn't exist

  if (error) {
    // Try querying pg_policies directly
    const { data: policies, error: polError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'org_memberships');
    
    if (polError) {
       // Try another way to inspect policies
       const { data: raw, error: rawError } = await supabase.rpc('inspect_rls', { t_name: 'org_memberships' });
       if (rawError) {
         console.log('Could not fetch policies via RPC or pg_policies. Table might be restricted.');
         
         // Let's try to see if RLS is enabled
         const { data: tableInfo, error: tableError } = await supabase
           .from('pg_tables')
           .select('*')
           .eq('tablename', 'org_memberships');
         console.log('Table Info:', tableInfo);
       } else {
         console.log('Policies:', raw);
       }
    } else {
      console.log('Policies:', policies);
    }
  } else {
    console.log('Policies:', data);
  }
}

checkRLS();
