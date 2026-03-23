const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rwvvsutsuutyvmapukvm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dnZzdXRzdXV0eXZtYXB1a3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTczNTUsImV4cCI6MjA4ODkzMzM1NX0.1bswghfoPi0xoM8QDOs0cEs8wiC84gnJa37seiIyT9Q';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  console.log('--- Checking profiles table ---');
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) console.error('Error fetching profiles:', error.message);
  else console.log('Profiles:', JSON.stringify(data, null, 2));
}

checkProfiles();
