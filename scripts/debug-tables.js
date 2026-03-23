const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rwvvsutsuutyvmapukvm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dnZzdXRzdXV0eXZtYXB1a3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTczNTUsImV4cCI6MjA4ODkzMzM1NX0.1bswghfoPi0xoM8QDOs0cEs8wiC84gnJa37seiIyT9Q';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugTables() {
  const tables = ['users', 'organizations', 'restaurants', 'leads'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      console.log(`Table '${table}' error:`, error.message, 'Code:', error.code);
    } else {
      console.log(`Table '${table}' exists. Data:`, data);
    }
  }
}

debugTables();
