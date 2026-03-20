const fs = require('fs');

try {
  let supabaseUrl = '';
  let supabaseKey = '';

  const envFile = fs.readFileSync('.env.local', 'utf8');
  for (let line of envFile.split('\n')) {
    if (line.trim().startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.trim().startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
  }

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  async function checkDatabase() {
    console.log('--- 🔍 SUPABASE DIAGNOSTIC ALGORITHM STARTING ---');
    
    // Check users table
    const { data: users, error: uErr } = await supabase.from('users').select('*').limit(1);
    if (uErr) {
      console.log('❌ USERS TABLE ERROR:', uErr.message);
    } else {
      console.log('✅ USERS TABLE is functioning correctly.');
      if (users.length > 0) {
        const columns = Object.keys(users[0]);
        const missing = [];
        if (!columns.includes('avatar_url')) missing.push('avatar_url');
        if (!columns.includes('title')) missing.push('title');
        if (!columns.includes('ring')) missing.push('ring');
        
        if (missing.length > 0) {
          console.log(`   ⚠️ WARNING: You have NOT added the following columns: ${missing.join(', ')}`);
        } else {
          console.log('   ✅ All Gen-Z Shop columns (avatar_url, title, ring) are successfully installed!');
        }
      } else {
        console.log('   --> Table is completely empty, but connection exists.');
      }
    }
  }

  checkDatabase();
} catch (e) {
  console.log('Diagnostic error:', e);
}
