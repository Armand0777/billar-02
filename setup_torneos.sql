-- =========================================================================
-- SCRIPT PARA CREAR LAS TABLAS DEL MÓDULO DE TORNEOS
-- =========================================================================

-- Tabla de Torneos
CREATE TABLE IF NOT EXISTS public.torneos (
  id_torneo uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  fecha_inicio timestamp with time zone NOT NULL,
  fecha_fin timestamp with time zone,
  costo_inscripcion numeric DEFAULT 0,
  premio_estimado numeric DEFAULT 0,
  estado text DEFAULT 'proximo' CHECK (estado IN ('proximo', 'en_curso', 'finalizado', 'cancelado')),
  puntos_recompensa integer DEFAULT 0,
  creado_por uuid REFERENCES public.usuarios(id_usuario),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT torneos_pkey PRIMARY KEY (id_torneo)
);

-- Tabla de Participantes Inscritos
CREATE TABLE IF NOT EXISTS public.participantes_torneo (
  id_participante uuid NOT NULL DEFAULT gen_random_uuid(),
  id_torneo uuid NOT NULL REFERENCES public.torneos(id_torneo) ON DELETE CASCADE,
  id_cliente uuid NOT NULL REFERENCES public.clientes(id_cliente) ON DELETE CASCADE,
  estado_pago text DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado')),
  posicion_final integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT participantes_torneo_pkey PRIMARY KEY (id_participante),
  CONSTRAINT unique_participante_torneo UNIQUE (id_torneo, id_cliente)
);

-- Habilitar RLS (Seguridad)
ALTER TABLE public.torneos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participantes_torneo ENABLE ROW LEVEL SECURITY;

-- Politicas para Torneos (Todos pueden ver, solo staff puede modificar)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'torneos' AND policyname = 'Lectura publica de torneos') THEN
        CREATE POLICY "Lectura publica de torneos" ON public.torneos FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'torneos' AND policyname = 'Modificacion staff de torneos') THEN
        CREATE POLICY "Modificacion staff de torneos" ON public.torneos FOR ALL USING (
            auth.uid() IN (SELECT auth_id FROM public.usuarios)
        );
    END IF;
END $$;

-- Politicas para Participantes (Todos pueden ver quién participa, clientes pueden inscribirse, staff maneja pagos)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'participantes_torneo' AND policyname = 'Lectura publica de participantes') THEN
        CREATE POLICY "Lectura publica de participantes" ON public.participantes_torneo FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'participantes_torneo' AND policyname = 'Clientes pueden inscribirse') THEN
        CREATE POLICY "Clientes pueden inscribirse" ON public.participantes_torneo FOR INSERT WITH CHECK (
            auth.uid() IN (SELECT auth_id FROM public.clientes WHERE id_cliente = participantes_torneo.id_cliente)
            OR auth.uid() IN (SELECT auth_id FROM public.usuarios)
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'participantes_torneo' AND policyname = 'Modificacion staff de participantes') THEN
        CREATE POLICY "Modificacion staff de participantes" ON public.participantes_torneo FOR UPDATE USING (
            auth.uid() IN (SELECT auth_id FROM public.usuarios)
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'participantes_torneo' AND policyname = 'Staff puede borrar participantes') THEN
        CREATE POLICY "Staff puede borrar participantes" ON public.participantes_torneo FOR DELETE USING (
            auth.uid() IN (SELECT auth_id FROM public.usuarios)
        );
    END IF;
END $$;
