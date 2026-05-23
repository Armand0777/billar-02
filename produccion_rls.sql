-- ====================================================================================
-- SCRIPT DE SEGURIDAD PARA PRODUCCIÓN (RLS - Row Level Security)
-- Este script protege la base de datos contra accesos no autorizados desde la API pública.
-- ====================================================================================

-- 1. Función auxiliar para determinar si un usuario es del staff (existe en tabla usuarios)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios WHERE auth_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Habilitar RLS en todas las tablas desprotegidas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones_mesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarifas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cajas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arqueos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campeonatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novedades ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para datos públicos (Catálogo, Mesas, Tarifas, Campeonatos, Avisos)
-- Cualquier persona (incluso sin login) puede LEER, pero solo el staff puede MODIFICAR
DROP POLICY IF EXISTS "lectura_publica_mesas" ON public.mesas;
CREATE POLICY "lectura_publica_mesas" ON public.mesas FOR SELECT TO public USING (true);
CREATE POLICY "staff_all_mesas" ON public.mesas FOR ALL TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "lectura_publica_tarifas" ON public.tarifas;
CREATE POLICY "lectura_publica_tarifas" ON public.tarifas FOR SELECT TO public USING (true);
CREATE POLICY "staff_all_tarifas" ON public.tarifas FOR ALL TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "lectura_publica_novedades" ON public.novedades;
CREATE POLICY "lectura_publica_novedades" ON public.novedades FOR SELECT TO public USING (true);
CREATE POLICY "staff_all_novedades" ON public.novedades FOR ALL TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "lectura_publica_campeonatos" ON public.campeonatos;
CREATE POLICY "lectura_publica_campeonatos" ON public.campeonatos FOR SELECT TO public USING (true);
CREATE POLICY "staff_all_campeonatos" ON public.campeonatos FOR ALL TO authenticated USING (public.is_staff());

-- 4. Políticas para datos puramente internos / administrativos
-- Solo el STAFF puede LEER y ESCRIBIR (Clientes NO tienen acceso a esto)
CREATE POLICY "staff_all_usuarios" ON public.usuarios FOR ALL TO authenticated USING (public.is_staff());
CREATE POLICY "staff_all_roles" ON public.roles FOR ALL TO authenticated USING (public.is_staff());
CREATE POLICY "staff_all_ventas" ON public.ventas FOR ALL TO authenticated USING (public.is_staff());
CREATE POLICY "staff_all_venta_items" ON public.venta_items FOR ALL TO authenticated USING (public.is_staff());
CREATE POLICY "staff_all_inventario" ON public.inventario FOR ALL TO authenticated USING (public.is_staff());
CREATE POLICY "staff_all_mov_inv" ON public.movimientos_inventario FOR ALL TO authenticated USING (public.is_staff());
CREATE POLICY "staff_all_sesiones" ON public.sesiones_mesa FOR ALL TO authenticated USING (public.is_staff());
CREATE POLICY "staff_all_cajas" ON public.cajas FOR ALL TO authenticated USING (public.is_staff());
CREATE POLICY "staff_all_arqueos" ON public.arqueos FOR ALL TO authenticated USING (public.is_staff());
CREATE POLICY "staff_all_mov_caja" ON public.movimientos_caja FOR ALL TO authenticated USING (public.is_staff());

-- 5. Excepción para Pedidos (Los clientes deben poder ver y crear sus propios pedidos)
CREATE POLICY "clientes_sus_pedidos_select" ON public.pedidos FOR SELECT TO authenticated USING (id_cliente IN (SELECT id_cliente FROM public.clientes WHERE auth_id = auth.uid()) OR public.is_staff());
CREATE POLICY "clientes_sus_pedidos_insert" ON public.pedidos FOR INSERT TO authenticated WITH CHECK (id_cliente IN (SELECT id_cliente FROM public.clientes WHERE auth_id = auth.uid()) OR public.is_staff());
CREATE POLICY "staff_all_pedidos" ON public.pedidos FOR ALL TO authenticated USING (public.is_staff());

CREATE POLICY "clientes_sus_items_select" ON public.pedido_items FOR SELECT TO authenticated USING (id_pedido IN (SELECT id_pedido FROM public.pedidos WHERE id_cliente IN (SELECT id_cliente FROM public.clientes WHERE auth_id = auth.uid())) OR public.is_staff());
CREATE POLICY "clientes_sus_items_insert" ON public.pedido_items FOR INSERT TO authenticated WITH CHECK (id_pedido IN (SELECT id_pedido FROM public.pedidos WHERE id_cliente IN (SELECT id_cliente FROM public.clientes WHERE auth_id = auth.uid())) OR public.is_staff());
CREATE POLICY "staff_all_pedido_items" ON public.pedido_items FOR ALL TO authenticated USING (public.is_staff());

-- 6. Excepción para Inscripciones (Los clientes deben poder inscribirse a torneos)
CREATE POLICY "clientes_sus_inscripciones" ON public.inscripciones FOR SELECT TO authenticated USING (id_cliente IN (SELECT id_cliente FROM public.clientes WHERE auth_id = auth.uid()) OR public.is_staff());
CREATE POLICY "clientes_sus_inscripciones_ins" ON public.inscripciones FOR INSERT TO authenticated WITH CHECK (id_cliente IN (SELECT id_cliente FROM public.clientes WHERE auth_id = auth.uid()) OR public.is_staff());
CREATE POLICY "staff_all_inscripciones" ON public.inscripciones FOR ALL TO authenticated USING (public.is_staff());
