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
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function reset() {
  console.log("Buscando el usuario en Auth...");
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error("Error al listar usuarios de Auth:", authError);
    return;
  }
  
  const targetUser = users.find(u => u.email === 'juancajero@gmail.com');
  
  if (!targetUser) {
    console.error("No se encontró el usuario juancajero@gmail.com en Auth.");
    return;
  }
  
  console.log("Usuario encontrado. ID:", targetUser.id);
  
  console.log("Restableciendo la contraseña de juancajero@gmail.com a 'juantest123'...");
  const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
    targetUser.id,
    { password: 'juantest123' }
  );
  
  if (updateError) {
    console.error("Error al actualizar la contraseña:", updateError);
  } else {
    console.log("Contraseña actualizada con éxito a 'juantest123'!");
  }
}

reset();
