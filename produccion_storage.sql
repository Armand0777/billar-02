-- ====================================================================================
-- FASE 3: ALMACENAMIENTO DE IMÁGENES (SUPABASE STORAGE)
-- Este script crea el "bucket" público donde se guardarán las fotos arrastradas.
-- ====================================================================================

-- 1. Crear el bucket llamado 'public_images' (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('public_images', 'public_images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Eliminar políticas anteriores si existieran para evitar duplicados
DROP POLICY IF EXISTS "Imágenes públicas" ON storage.objects;
DROP POLICY IF EXISTS "Staff puede subir imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Staff puede actualizar imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Staff puede eliminar imágenes" ON storage.objects;

-- 3. Crear políticas de seguridad para el Storage
-- Cualquier persona puede ver las imágenes (Público general)
CREATE POLICY "Imágenes públicas" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'public_images' );

-- Solo el Staff (usuarios registrados) puede subir, modificar o eliminar imágenes
CREATE POLICY "Staff puede subir imágenes" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'public_images' );

CREATE POLICY "Staff puede actualizar imágenes" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING ( bucket_id = 'public_images' );

CREATE POLICY "Staff puede eliminar imágenes" 
ON storage.objects FOR DELETE 
TO authenticated 
USING ( bucket_id = 'public_images' );
