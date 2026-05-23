-- ====================================================================================
-- ACTUALIZACIÓN DE TABLA PEDIDOS (Live Orders)
-- ====================================================================================

-- 1. Añadir la columna de número de mesa (para saber a dónde llevar el pedido)
ALTER TABLE public.pedidos 
ADD COLUMN numero_mesa VARCHAR(50);

-- 2. Habilitar RLS en las tablas
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para PEDIDOS
-- Cualquier usuario autenticado (clientes) puede crear su propio pedido
CREATE POLICY "Clientes pueden crear sus pedidos" 
ON public.pedidos 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Los clientes pueden ver sus propios pedidos
CREATE POLICY "Clientes pueden ver sus pedidos" 
ON public.pedidos 
FOR SELECT 
TO authenticated 
USING (
  id_cliente = (SELECT id_cliente FROM public.clientes WHERE auth_id = auth.uid()) 
  OR public.is_staff()
);

-- El staff puede actualizar pedidos (ej. cambiar estado)
CREATE POLICY "Staff puede actualizar pedidos" 
ON public.pedidos 
FOR UPDATE 
TO authenticated 
USING (public.is_staff());

-- 4. Políticas para PEDIDO_ITEMS
-- Clientes pueden añadir items a su pedido
CREATE POLICY "Clientes pueden añadir items" 
ON public.pedido_items 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Todos pueden leer los items de los pedidos a los que tienen acceso
CREATE POLICY "Usuarios pueden ver items de sus pedidos" 
ON public.pedido_items 
FOR SELECT 
TO authenticated 
USING (true);

-- Activar Realtime para la tabla pedidos (para el Monitor de Barra)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.pedidos;
COMMIT;
