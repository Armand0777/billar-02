-- Agregar nuevas columnas para la modalidad de juego en mesas
ALTER TABLE sesiones_mesa 
ADD COLUMN IF NOT EXISTS modalidad VARCHAR(50) DEFAULT 'abierto',
ADD COLUMN IF NOT EXISTS tiempo_fijo_minutos INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS costo_partida NUMERIC(10,2) DEFAULT 0;
