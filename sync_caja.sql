-- =========================================================================
-- TRIGGER PARA SINCRONIZAR VENTAS COMPLETADAS HACIA LA CAJA
-- =========================================================================

CREATE OR REPLACE FUNCTION sync_venta_to_caja()
RETURNS TRIGGER AS $$
DECLARE
    v_caja_id UUID;
    v_descripcion TEXT;
BEGIN
    -- Solo sincronizar si el estado de la venta es o cambia a 'completada'
    IF NEW.estado = 'completada' AND (TG_OP = 'INSERT' OR OLD.estado IS DISTINCT FROM 'completada') THEN
        
        -- Buscar la caja principal abierta y activa para esta sucursal
        SELECT id_caja INTO v_caja_id 
        FROM cajas 
        WHERE id_sucursal = NEW.id_sucursal AND activo = true 
        LIMIT 1;

        -- Si encontramos una caja, inyectamos el movimiento
        IF v_caja_id IS NOT NULL THEN
            -- Generar descripción según el método de pago
            IF NEW.metodo_pago = 'efectivo' THEN
                v_descripcion := 'Ingreso por Venta (EFECTIVO)';
            ELSIF NEW.metodo_pago = 'qr' THEN
                v_descripcion := 'Ingreso por Venta (QR)';
            ELSE
                v_descripcion := 'Ingreso por Venta (' || UPPER(NEW.metodo_pago::text) || ')';
            END IF;

            -- Inyectar el ingreso a la caja
            INSERT INTO movimientos_caja (
                id_caja, 
                id_sucursal, 
                id_usuario, 
                tipo, 
                monto, 
                descripcion, 
                referencia_id
            ) VALUES (
                v_caja_id, 
                NEW.id_sucursal, 
                NEW.id_usuario, 
                'ingreso', 
                NEW.total, 
                v_descripcion, 
                NEW.id_venta
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar el trigger si ya existe para evitar duplicados
DROP TRIGGER IF EXISTS trigger_sync_venta_to_caja ON ventas;

-- Crear el trigger sobre la tabla ventas
CREATE TRIGGER trigger_sync_venta_to_caja
AFTER INSERT OR UPDATE ON ventas
FOR EACH ROW
EXECUTE FUNCTION sync_venta_to_caja();
