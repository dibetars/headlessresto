const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rwvvsutsuutyvmapukvm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dnZzdXRzdXV0eXZtYXB1a3ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM1NzM1NSwiZXhwIjoyMDg4OTMzMzU1fQ.CgRXj0xU2eglttCX_3siYlWI0-zpYsaT9_KaY-Tf5l8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function bruteForceRole() {
  const roles = [
    'admin', 'super_admin', 'restaurant_admin', 'kitchen', 'waiter', 'cashier',
    'ADMIN', 'SUPER_ADMIN', 'RESTAURANT_ADMIN', 'KITCHEN', 'WAITER', 'CASHIER',
    'owner', 'manager', 'staff', 'OWNER', 'MANAGER', 'STAFF',
    'user', 'USER', 'admin_role', 'staff_role', 'ADMIN_ROLE', 'STAFF_ROLE'
  ];

  const successfulRoles = [];
  for (const role of roles) {
    console.log(`Trying role: ${role}`);
    const { data, error } = await supabase
      .from('org_memberships')
      .insert({
        org_id: '1673dc6c-e666-4c82-b588-bda43f8b18eb',
        user_id: 'fe456375-3f97-420e-96fd-966daca19186',
        role: role
      });

    if (!error) {
      console.log(`SUCCESS with role: ${role}`);
      successfulRoles.push(role);
      // Clean up for next attempt
      await supabase
        .from('org_memberships')
        .delete()
        .eq('user_id', 'fe456375-3f97-420e-96fd-966daca19186')
        .eq('role', role);
    } else {
      console.log(`Error for ${role}: ${error.message} - ${error.details || ''}`);
    }
  }
  console.log('--- Summary of Successful Roles ---');
  console.log(successfulRoles);
}

bruteForceRole();
