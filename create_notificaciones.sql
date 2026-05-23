-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id_notificacion UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'success'
    leida BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activar RLS (Opcional pero recomendado, por ahora lo dejamos público para lectura rápida desde el dashboard)
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (asumiendo que los empleados pueden leerlas)
CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON notificaciones FOR SELECT 
TO authenticated 
USING (true);

-- Política para actualizar (marcar como leída)
CREATE POLICY "Permitir update a usuarios autenticados" 
ON notificaciones FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Política para insertar (desde código de back-end o admin)
CREATE POLICY "Permitir insert a usuarios autenticados" 
ON notificaciones FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Activar Realtime para esta tabla
-- Esto permite que supabase.channel escuche los INSERT
ALTER PUBLICATION supabase_realtime ADD TABLE notificaciones;
