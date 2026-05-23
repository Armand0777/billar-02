-- ====================================================================================
-- FASE 2: TABLA DE CONFIGURACIÓN GLOBAL
-- ====================================================================================

-- 1. Crear la tabla de configuración
CREATE TABLE IF NOT EXISTS public.configuracion (
    id_configuracion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID REFERENCES public.usuarios(id_usuario) ON DELETE SET NULL,
    nombre_negocio VARCHAR(100) DEFAULT 'Billar El Malandro',
    moneda VARCHAR(10) DEFAULT 'Bs.',
    tarifa_hora_mesa NUMERIC(10,2) DEFAULT 30.00,
    sonidos_activados BOOLEAN DEFAULT true,
    impresion_automatica BOOLEAN DEFAULT false,
    modo_nocturno BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insertar configuración por defecto si la tabla está vacía
INSERT INTO public.configuracion (nombre_negocio, moneda, tarifa_hora_mesa)
SELECT 'Billar El Malandro', 'Bs.', 30.00
WHERE NOT EXISTS (SELECT 1 FROM public.configuracion);

-- 3. Proteger la tabla con RLS (Seguridad)
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública (para que el catálogo lea el nombre o moneda si hace falta)
CREATE POLICY "lectura_publica_configuracion" ON public.configuracion FOR SELECT TO public USING (true);

-- Solo el Staff puede modificar la configuración
CREATE POLICY "staff_all_configuracion" ON public.configuracion FOR ALL TO authenticated USING (public.is_staff());
