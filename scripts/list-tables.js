const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rwvvsutsuutyvmapukvm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dnZzdXRzdXV0eXZtYXB1a3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTczNTUsImV4cCI6MjA4ODkzMzM1NX0.1bswghfoPi0xoM8QDOs0cEs8wiC84gnJa37seiIyT9Q';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  console.log('--- Listing Tables ---');
  
  // Try to query from postgres system tables
  const { data, error } = await supabase.rpc('get_tables'); // This probably won't work unless defined
  if (error) {
    console.log('RPC get_tables failed, trying direct select...');
    // In Supabase, we can't easily list tables via anon key unless exposed
    // Let's try to query some common tables to see what else exists
    const tables = ['users', 'organizations', 'org_memberships', 'profiles', 'orders', 'menu_items', 'reservations', 'tables', 'leads'];
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        console.log(`Table '${table}' error:`, error.message);
        console.log(`Table '${table}' does not exist or is not accessible.`);
      } else {
        console.log(`Table '${table}' exists.`);
      }
    }
  }
}

listTables();
