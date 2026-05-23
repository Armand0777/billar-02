-- ==========================================
-- MÓDULO ASISTENCIA (Reloj Checador)
-- ==========================================
CREATE TABLE IF NOT EXISTS asistencias (
    id_asistencia UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_usuario UUID REFERENCES usuarios(id_usuario) NOT NULL,
    id_sucursal UUID REFERENCES sucursales(id_sucursal) NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada TIMESTAMPTZ NOT NULL,
    hora_salida TIMESTAMPTZ,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_usuario, fecha) -- Solo un registro por usuario por día
);

-- ==========================================
-- MÓDULO CAMPEONATOS
-- ==========================================
CREATE TABLE IF NOT EXISTS campeonatos (
    id_campeonato UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_sucursal UUID REFERENCES sucursales(id_sucursal) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    cupo_maximo INT,
    precio_inscripcion NUMERIC(10,2) DEFAULT 0,
    premio VARCHAR(200),
    estado VARCHAR(50) DEFAULT 'proximo', -- 'proximo', 'en_curso', 'finalizado'
    created_by UUID REFERENCES usuarios(id_usuario),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inscripciones (
    id_inscripcion UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_campeonato UUID REFERENCES campeonatos(id_campeonato) NOT NULL,
    id_cliente UUID REFERENCES clientes(id_cliente) NOT NULL,
    estado_pago VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'pagado'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_campeonato, id_cliente) -- Un cliente no puede inscribirse dos veces al mismo torneo
);
