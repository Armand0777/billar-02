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
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const anonClient = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Iniciando prueba de RLS en ventas...");
  
  // 1. Iniciar sesión como juan
  const { data: authData } = await anonClient.auth.signInWithPassword({
    email: 'juancajero@gmail.com',
    password: 'juantest123'
  });
  
  const juanClient = createClient(supabaseUrl, supabaseKey);
  await juanClient.auth.setSession({
    access_token: authData.session.access_token,
    refresh_token: authData.session.refresh_token
  });
  
  // 2. Buscar ventas
  const { data: ventas, error: vErr } = await juanClient
    .from('ventas')
    .select('*')
    .limit(5);
    
  if (vErr) {
    console.error("No se pudo obtener ventas:", vErr);
    return;
  }
  
  console.log("Ventas encontradas:", ventas.map(v => ({ id: v.id_venta, total: v.total, estado: v.estado })));
  
  if (ventas.length === 0) {
    console.log("No hay ventas para probar.");
    return;
  }
  
  // 3. Intentar actualizar una venta
  const targetVenta = ventas.find(v => v.estado === 'pendiente') || ventas[0];
  console.log("Intentando actualizar venta:", targetVenta.id_venta);
  
  const { data: upData, error: upErr } = await juanClient
    .from('ventas')
    .update({
      total: 5.00,
      estado: 'completada',
      metodo_pago: 'efectivo'
    })
    .eq('id_venta', targetVenta.id_venta)
    .select();
    
  if (upErr) {
    console.error("Error al actualizar venta:", upErr);
  } else {
    console.log("Resultado de actualización de venta:", upData);
  }
}

test();
