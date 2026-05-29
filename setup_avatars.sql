-- =========================================================================
-- SCRIPT PARA HABILITAR FOTOS DE PERFIL (AVATARES) EN SUPABASE
-- =========================================================================

-- 1. Agregar la columna avatar_url a las tablas si no existen
DO $$ 
BEGIN
  ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS avatar_url text;
  ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS avatar_url text;
END $$;

-- 2. Crear el Bucket "avatars" en Supabase Storage (hacerlo público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Crear políticas de seguridad (RLS) para el Storage
DO $$
BEGIN
    -- Permitir que CUALQUIER PERSONA pueda VER las fotos (necesario para cargarlas en la web)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Avatar images are publicly accessible'
    ) THEN
        CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
    END IF;

    -- Permitir que usuarios LOGUEADOS puedan SUBIR fotos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload their own avatars'
    ) THEN
        CREATE POLICY "Users can upload their own avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
    END IF;

    -- Permitir que usuarios LOGUEADOS puedan ACTUALIZAR sus fotos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update their own avatars'
    ) THEN
        CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
    END IF;

    -- Permitir que usuarios LOGUEADOS puedan BORRAR sus fotos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete their own avatars'
    ) THEN
        CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');
    END IF;
END $$;
