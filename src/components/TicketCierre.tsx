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
    tiempoTotal: string;
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

const SEP = "--------------------------------";

const TicketCierre = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[80mm] mx-auto">
      {/* Botón Imprimir - siempre visible arriba */}
      <button
        onClick={handlePrint}
        className="mb-3 print:hidden flex items-center gap-2 bg-billanga-primary text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-billanga-primary-dark transition-colors text-sm shrink-0"
      >
        <Printer className="w-4 h-4" /> Imprimir Ticket Z
      </button>

      {/* Ticket visual */}
      <div className="bg-white text-black rounded-lg w-full shadow-2xl overflow-hidden">
        <div ref={ref} className="ticket-content font-mono px-3 py-2" style={{ fontSize: '10px', lineHeight: '1.3' }}>
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * { visibility: hidden; }
              .ticket-content, .ticket-content * { visibility: visible; }
              .ticket-content { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 80mm; 
                padding: 2mm;
                margin: 0;
                font-size: 10px;
                line-height: 1.3;
              }
            }
          `}} />

          {/* Encabezado */}
          <div className="text-center" style={{ marginBottom: '4px' }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold' }}>EL BILLANGA</p>
            <p style={{ fontSize: '10px' }}>{data.sucursalNombre}</p>
            <p>{SEP}</p>
            <p style={{ fontWeight: 'bold' }}>CIERRE DE CAJA</p>
            <p>{SEP}</p>
          </div>

          {/* Info Turno */}
          <div style={{ marginBottom: '2px' }}>
            <p><strong>Cajero:</strong> {data.cajeroNombre}</p>
            <p><strong>Inicio:</strong> {new Date(data.fechaApertura).toLocaleString("es-BO")}</p>
            <p><strong>Fin:</strong> {new Date(data.fechaCierre).toLocaleString("es-BO")}</p>
          </div>

          <p>{SEP}</p>

          {/* Desglose Mesas */}
          {data.desgloseMesas.length > 0 && (
            <div style={{ marginBottom: '2px' }}>
              <p style={{ fontWeight: 'bold' }}>MESAS (BILLAR)</p>
              <div className="flex justify-between" style={{ fontWeight: 'bold', borderBottom: '1px dashed #999', paddingBottom: '1px', marginBottom: '1px' }}>
                <span>Tipo</span>
                <span>Hs.</span>
                <span>Total</span>
              </div>
              {data.desgloseMesas.map((m, i) => (
                <div key={i} className="flex justify-between">
                  <span className="capitalize" style={{ width: '45%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.tipo}</span>
                  <span style={{ width: '25%', textAlign: 'right' }}>{m.tiempoTotal}</span>
                  <span style={{ width: '30%', textAlign: 'right' }}>{m.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <p style={{ textAlign: 'right', fontWeight: 'bold' }}>Sub: Bs.{data.totalVentasMesas.toFixed(2)}</p>
            </div>
          )}

          {data.desgloseMesas.length > 0 && <p>{SEP}</p>}

          {/* Desglose Productos */}
          {data.desgloseProductos.length > 0 && (
            <div style={{ marginBottom: '2px' }}>
              <p style={{ fontWeight: 'bold' }}>PRODUCTOS</p>
              <div className="flex justify-between" style={{ fontWeight: 'bold', borderBottom: '1px dashed #999', paddingBottom: '1px', marginBottom: '1px' }}>
                <span style={{ width: '55%' }}>Producto</span>
                <span style={{ width: '15%', textAlign: 'right' }}>Cnt</span>
                <span style={{ width: '30%', textAlign: 'right' }}>Total</span>
              </div>
              {data.desgloseProductos.map((p, i) => (
                <div key={i} className="flex justify-between">
                  <span style={{ width: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</span>
                  <span style={{ width: '15%', textAlign: 'right' }}>{p.cantidad}</span>
                  <span style={{ width: '30%', textAlign: 'right' }}>{(p.subtotal || 0).toFixed(2)}</span>
                </div>
              ))}
              <p style={{ textAlign: 'right', fontWeight: 'bold' }}>Sub: Bs.{data.totalVentasProductos.toFixed(2)}</p>
            </div>
          )}

          <p>{SEP}</p>

          {/* Resumen Caja */}
          <div style={{ marginBottom: '2px' }}>
            <p style={{ fontWeight: 'bold' }}>RESUMEN</p>
            <div className="flex justify-between"><span>Monto Inicial:</span><span>Bs.{data.montoInicial.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>+ Ventas:</span><span>Bs.{(data.totalVentasMesas + data.totalVentasProductos).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>+ Ingresos:</span><span>Bs.{data.totalIngresosAdicionales.toFixed(2)}</span></div>
            <div className="flex justify-between" style={{ color: '#dc2626' }}><span>- Egresos:</span><span>Bs.{data.totalEgresos.toFixed(2)}</span></div>
            <div className="flex justify-between" style={{ fontWeight: 'bold', borderTop: '1px solid #333', paddingTop: '1px', marginTop: '1px' }}>
              <span>SALDO ESPERADO:</span><span>Bs.{data.saldoEstimado.toFixed(2)}</span>
            </div>
          </div>

          <p>{SEP}</p>

          {/* Formas de Pago */}
          <div style={{ marginBottom: '2px' }}>
            <p style={{ fontWeight: 'bold' }}>FORMAS DE PAGO</p>
            <div className="flex justify-between"><span>Efectivo:</span><span>Bs.{data.metodosPago.efectivo.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>QR/Transf.:</span><span>Bs.{data.metodosPago.qr.toFixed(2)}</span></div>
          </div>

          <p>================================</p>

          {/* Arqueo Real */}
          <div style={{ marginBottom: '2px' }}>
            <div className="flex justify-between" style={{ fontWeight: 'bold' }}>
              <span>CIERRE REAL:</span><span>Bs.{data.montoCierreReal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ fontWeight: 'bold' }}>
              <span>DIFERENCIA:</span><span>Bs.{data.diferencia.toFixed(2)}</span>
            </div>
            {data.observacion && (
              <div style={{ marginTop: '2px', fontSize: '9px' }}>
                <p><strong>Obs:</strong> {data.observacion}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center" style={{ marginTop: '4px', paddingTop: '2px', borderTop: '1px dashed #999' }}>
            <p>*** FIN ***</p>
            <p style={{ fontSize: '8px', color: '#888' }}>Sistema El Billanga</p>
          </div>
        </div>
      </div>
    </div>
  );
});

TicketCierre.displayName = "TicketCierre";

export default TicketCierre;
