-- Añadir columna de imagen a la tabla campeonatos
ALTER TABLE public.campeonatos ADD COLUMN IF NOT EXISTS imagen_url TEXT;
