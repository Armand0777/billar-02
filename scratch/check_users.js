const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key to list auth users or profile users

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Consultando la lista de empleados/cajeros...");
  const { data: users, error } = await supabase
    .from('usuarios')
    .select('*, roles:roles(nombre, nivel)');
    
  if (error) {
    console.error("Error al consultar usuarios:", error);
    return;
  }
  
  console.log("--- USUARIOS REGISTRADOS EN LA TABLA public.usuarios ---");
  users.forEach(u => {
    console.log(`Nombre: ${u.nombre} | Email: ${u.email} | Rol: ${u.roles ? u.roles.nombre : 'Sin rol'} (Nivel: ${u.roles ? u.roles.nivel : 'N/A'}) | Activo: ${u.activo}`);
  });
}

check();
