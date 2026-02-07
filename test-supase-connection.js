// test-supabase-connection.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);
console.log('Key length:', supabaseKey ? supabaseKey.length : 0);

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing environment variables!');
  console.log('\nMake sure .env.local has:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://...');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...');
  process.exit(1);
}

try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('\n✅ Supabase client created successfully!');
  
  // Try a simple query
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.log('\n⚠️  Auth check failed:', error.message);
    } else {
      console.log('\n✅ Connection to Supabase working!');
    }
  });
} catch (error) {
  console.error('\n❌ Error creating client:', error.message);
}