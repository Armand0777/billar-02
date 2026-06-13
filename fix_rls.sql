-- =====================================================================
-- SOLUCIÓN A PROBLEMAS DE RLS (ROW LEVEL SECURITY) EN SUPABASE
-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase.
-- =====================================================================

-- ---------------------------------------------------------------------
-- OPCIÓN 1: DESACTIVAR RLS (Recomendado y más rápido para este proyecto)
-- Como es una aplicación de administración interna de negocio local,
-- desactivar RLS en estas tablas asegura que no ocurran bloqueos de permisos.
-- ---------------------------------------------------------------------

ALTER TABLE public.ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.venta_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_mesa DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- OPCIÓN 2: MANTENER RLS Y CREAR POLÍTICAS PERMISIVAS (Alternativa)
-- Si prefieres mantener RLS activo, ejecuta las siguientes líneas para
-- otorgar todos los permisos de lectura y escritura a los cajeros/usuarios autenticados.
-- (No es necesario ejecutar esto si ya aplicaste la Opción 1).
-- ---------------------------------------------------------------------

/*
-- 1. Habilitar RLS por si acaso
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_mesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para "ventas"
DROP POLICY IF EXISTS "Permitir todo a autenticados en ventas" ON public.ventas;
CREATE POLICY "Permitir todo a autenticados en ventas"
  ON public.ventas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Políticas para "venta_items"
DROP POLICY IF EXISTS "Permitir todo a autenticados en venta_items" ON public.venta_items;
CREATE POLICY "Permitir todo a autenticados en venta_items"
  ON public.venta_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Políticas para "sesiones_mesa"
DROP POLICY IF EXISTS "Permitir todo a autenticados en sesiones_mesa" ON public.sesiones_mesa;
CREATE POLICY "Permitir todo a autenticados en sesiones_mesa"
  ON public.sesiones_mesa
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Políticas para "inventario"
DROP POLICY IF EXISTS "Permitir todo a autenticados en inventario" ON public.inventario;
CREATE POLICY "Permitir todo a autenticados en inventario"
  ON public.inventario
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
*/
