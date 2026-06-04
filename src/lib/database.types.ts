// Tipos generados a partir del esquema SQL de Supabase
// Archivo de referencia para TypeScript

export type Database = {
  public: {
    Tables: {
      sucursales: {
        Row: {
          id_sucursal: string
          nombre: string
          direccion: string | null
          telefono: string | null
          activo: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['sucursales']['Row'], 'id_sucursal' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['sucursales']['Insert']>
      }
      categorias: {
        Row: {
          id_categoria: string
          nombre: string
          descripcion: string | null
          created_at: string
          deleted_at: string | null
        }
      }
      productos: {
        Row: {
          id_producto: string
          id_categoria: string
          nombre: string
          codigo: string | null
          precio_venta: number
          precio_costo: number | null
          imagen_url: string | null
          activo: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
        }
      }
      inventario: {
        Row: {
          id_inventario: string
          id_sucursal: string
          id_producto: string
          stock: number
          stock_minimo: number
          updated_at: string
        }
      }
      mesas: {
        Row: {
          id_mesa: string
          id_sucursal: string
          numero: number
          nombre: string | null
          tipo: 'pool' | 'snooker' | 'americana' | 'carambola' | 'cacho'
          activo: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
      }
      tarifas: {
        Row: {
          id_tarifa: string
          id_sucursal: string
          nombre: string
          precio_hora: number
          tipo_dia: 'todos' | 'semana' | 'finde' | 'feriado'
          hora_inicio: string | null
          hora_fin: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
      }
      roles: {
        Row: {
          id_rol: string
          nombre: string
          descripcion: string | null
          nivel: number
          created_at: string
        }
      }
      permisos: {
        Row: {
          id_permiso: string
          codigo: string
          descripcion: string | null
          modulo: string
          created_at: string
        }
      }
      usuarios: {
        Row: {
          id_usuario: string
          auth_id: string | null
          nombre: string
          email: string
          avatar_url: string | null
          activo: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
        }
      }
      usuario_sucursal: {
        Row: {
          id_usuario_sucursal: string
          id_usuario: string
          id_sucursal: string | null
          id_rol: string
          es_flotante: boolean
          activo: boolean
          fecha_inicio: string
          fecha_fin: string | null
          created_at: string
        }
      }
      clientes: {
        Row: {
          id_cliente: string
          auth_id: string | null
          nombre: string
          email: string | null
          telefono: string | null
          direccion: string | null
          puntos_fidelidad: number
          activo: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
      }
      ventas: {
        Row: {
          id_venta: string
          id_sucursal: string
          id_sesion: string | null
          id_usuario: string
          id_cliente: string | null
          total: number
          metodo_pago: 'efectivo' | 'tarjeta' | 'qr' | 'fiado' | 'mixto'
          estado: 'completada' | 'anulada' | 'pendiente'
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
        }
      }
      pedidos: {
        Row: {
          id_pedido: string
          id_cliente: string
          id_sucursal: string
          total: number
          estado: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado'
          tipo: 'online' | 'presencial'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
      }
      campeonatos: {
        Row: {
          id_campeonato: string
          id_sucursal: string
          nombre: string
          descripcion: string | null
          fecha_inicio: string
          fecha_fin: string | null
          cupo_maximo: number | null
          precio_inscripcion: number
          premio: string | null
          modalidad: 'eliminacion_simple' | 'doble_eliminacion' | 'round_robin' | 'grupos'
          estado: 'proximo' | 'en_curso' | 'finalizado' | 'cancelado'
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
        }
      }
      novedades: {
        Row: {
          id_novedad: string
          id_sucursal: string | null
          titulo: string
          contenido: string | null
          tipo: 'noticia' | 'oferta' | 'evento' | 'campeonato'
          imagen_url: string | null
          activo: boolean
          publicado_en: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
        }
      }
    }
  }
}
