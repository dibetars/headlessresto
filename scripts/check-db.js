const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rwvvsutsuutyvmapukvm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3dnZzdXRzdXV0eXZtYXB1a3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTczNTUsImV4cCI6MjA4ODkzMzM1NX0.1bswghfoPi0xoM8QDOs0cEs8wiC84gnJa37seiIyT9Q';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
  console.log('--- Checking DB ---');
  
  // Check users table
  console.log('\nChecking users table...');
  const { data: users, error: usersError } = await supabase.from('users').select('*');
  if (usersError) console.error('Error fetching users:', usersError.message);
  else console.log('Users:', JSON.stringify(users, null, 2));

  // Check organizations table
  console.log('\nChecking organizations table...');
  const { data: orgs, error: orgsError } = await supabase.from('organizations').select('*');
  if (orgsError) console.error('Error fetching organizations:', orgsError.message);
  else console.log('Organizations:', JSON.stringify(orgs, null, 2));

  // Check restaurants table
  console.log('\nChecking restaurants table...');
  const { data: restaurants, error: restaurantsError } = await supabase.from('restaurants').select('*');
  if (restaurantsError) console.error('Error fetching restaurants:', restaurantsError.message);
  else console.log('Restaurants:', JSON.stringify(restaurants, null, 2));
}

checkDB();
