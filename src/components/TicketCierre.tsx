"use client";

import React, { forwardRef } from "react";
import { Printer } from "lucide-react";

export interface TicketCierreData {
  sucursalNombre: string;
  cajeroNombre: string;
  fechaApertura: string;
  fechaCierre: string;
  montoInicial: number;
  totalVentasProductos: number;
  totalVentasMesas: number;
  totalIngresosAdicionales: number;
  totalEgresos: number;
  saldoEstimado: number;
  montoCierreReal: number;
  diferencia: number;
  observacion?: string;
  desgloseProductos: {
    nombre: string;
    cantidad: number;
    subtotal: number;
  }[];
  desgloseMesas: {
    tipo: string;
    tiempoTotal: string; // Ej: "10.5h"
    subtotal: number;
  }[];
  metodosPago: {
    efectivo: number;
    qr: number;
  };
}

interface Props {
  data: TicketCierreData | null;
}

const TicketCierre = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-black p-6 rounded-lg w-full max-w-[80mm] mx-auto shadow-2xl relative">
      {/* Botón Imprimir (oculto en impresión) */}
      <button 
        onClick={handlePrint}
        className="absolute -top-12 right-0 print:hidden flex items-center gap-2 bg-billanga-primary text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-billanga-primary-dark transition-colors"
      >
        <Printer className="w-5 h-5" /> Imprimir Ticket Z
      </button>

      {/* Contenido del Ticket */}
      <div ref={ref} className="ticket-content font-mono text-xs leading-tight">
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * { visibility: hidden; }
            .ticket-content, .ticket-content * { visibility: visible; }
            .ticket-content { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 80mm; 
              padding: 0;
              margin: 0;
            }
          }
        `}} />
        
        {/* Encabezado */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold uppercase mb-1">EL BILLANGA</h2>
          <p className="text-sm font-bold">{data.sucursalNombre}</p>
          <p>================================</p>
          <p className="font-bold text-sm">REPORTE Z - CIERRE TURNO</p>
          <p>================================</p>
        </div>

        {/* Info Turno */}
        <div className="mb-4 space-y-1">
          <p><strong>Cajero:</strong> {data.cajeroNombre}</p>
          <p><strong>Apertura:</strong> {new Date(data.fechaApertura).toLocaleString("es-BO")}</p>
          <p><strong>Cierre:</strong> {new Date(data.fechaCierre).toLocaleString("es-BO")}</p>
        </div>

        <p>--------------------------------</p>

        {/* Desglose Mesas */}
        {data.desgloseMesas.length > 0 && (
          <div className="mb-3">
            <p className="font-bold mb-1">VENTAS DE MESAS (BILLAR)</p>
            <div className="flex justify-between font-bold border-b border-black/20 pb-1 mb-1">
              <span>Tipo</span>
              <span>Hs.</span>
              <span>Total</span>
            </div>
            {data.desgloseMesas.map((m, i) => (
              <div key={i} className="flex justify-between">
                <span className="capitalize w-16 truncate">{m.tipo}</span>
                <span className="text-right">{m.tiempoTotal}</span>
                <span>{m.subtotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="text-right font-bold mt-1">
              Subtotal: Bs. {data.totalVentasMesas.toFixed(2)}
            </div>
          </div>
        )}

        <p>--------------------------------</p>

        {/* Desglose Productos */}
        {data.desgloseProductos.length > 0 && (
          <div className="mb-3">
            <p className="font-bold mb-1">VENTAS DE PRODUCTOS</p>
            <div className="flex justify-between font-bold border-b border-black/20 pb-1 mb-1">
              <span className="w-20">Producto</span>
              <span>Cant.</span>
              <span>Total</span>
            </div>
            {data.desgloseProductos.map((p, i) => (
              <div key={i} className="flex justify-between">
                <span className="w-20 truncate block">{p.nombre}</span>
                <span className="w-8 text-right block">{p.cantidad}</span>
                <span className="text-right block">{(p.subtotal || 0).toFixed(2)}</span>
              </div>
            ))}
            <div className="text-right font-bold mt-1">
              Subtotal: Bs. {data.totalVentasProductos.toFixed(2)}
            </div>
          </div>
        )}

        <p>--------------------------------</p>

        {/* Resumen Caja */}
        <div className="mb-4 space-y-1">
          <p className="font-bold">RESUMEN DE CAJA</p>
          <div className="flex justify-between">
            <span>Monto Inicial:</span>
            <span>Bs. {data.montoInicial.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>+ Ventas (Mesas + Prod):</span>
            <span>Bs. {(data.totalVentasMesas + data.totalVentasProductos).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>+ Ingresos Manuales:</span>
            <span>Bs. {data.totalIngresosAdicionales.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>- Egresos Manuales:</span>
            <span>Bs. {data.totalEgresos.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm border-t border-black/40 mt-1 pt-1">
            <span>SALDO ESPERADO:</span>
            <span>Bs. {data.saldoEstimado.toFixed(2)}</span>
          </div>
        </div>

        <p>--------------------------------</p>

        {/* Desglose Pago */}
        <div className="mb-4 space-y-1">
          <p className="font-bold">FORMAS DE PAGO (INGRESOS)</p>
          <div className="flex justify-between">
            <span>Efectivo:</span>
            <span>Bs. {data.metodosPago.efectivo.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>QR / Transf.:</span>
            <span>Bs. {data.metodosPago.qr.toFixed(2)}</span>
          </div>
        </div>

        <p>================================</p>

        {/* Arqueo Real */}
        <div className="mb-4 space-y-1">
          <div className="flex justify-between font-bold text-sm">
            <span>CIERRE REAL:</span>
            <span>Bs. {data.montoCierreReal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>DIFERENCIA:</span>
            <span>Bs. {data.diferencia.toFixed(2)}</span>
          </div>
          {data.observacion && (
            <div className="mt-2 text-[10px]">
              <p><strong>Observaciones:</strong></p>
              <p>{data.observacion}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p>*** FIN DE REPORTE ***</p>
          <p className="mt-2 text-[10px] text-gray-500">Impreso por Sistema El Billanga</p>
        </div>
      </div>
    </div>
  );
});

TicketCierre.displayName = "TicketCierre";

export default TicketCierre;
