import fs from 'fs';

// Read .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    env[key.trim()] = rest.join('=').trim().replace(/["']/g, '');
  }
});

const URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const KEY = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

async function test() {
  const res = await fetch(`${URL}/rest/v1/usuarios?select=*`, {
    headers: {
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`
    }
  });
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}

test();
