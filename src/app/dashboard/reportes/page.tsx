"use client";

import { useState, useEffect } from "react";
import {
  BarChart3, Calendar, Download, RefreshCw, AlertTriangle,
  TrendingUp, ShoppingBag, Banknote, Users
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ReportesPage() {
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState("");
  const [ventas, setVentas] = useState<any[]>([]);

  // Filtros
  const [rangoFechas, setRangoFechas] = useState("mes"); // hoy, semana, mes, año
  
  const supabase = createClient();

  useEffect(() => { loadData(); }, [rangoFechas]);

  const loadData = async () => {
    setLoading(true);
    setDbError("");
    try {
      const hoy = new Date();
      let fechaInicio = new Date();
      
      switch (rangoFechas) {
        case "hoy": fechaInicio.setHours(0,0,0,0); break;
        case "semana": fechaInicio.setDate(hoy.getDate() - 7); break;
        case "mes": fechaInicio.setMonth(hoy.getMonth() - 1); break;
        case "año": fechaInicio.setFullYear(hoy.getFullYear() - 1); break;
      }

      const { data: vData, error: vError } = await supabase
        .from("ventas")
        .select(`
          id_venta, total, metodo_pago, estado, created_at,
          venta_items(cantidad, subtotal, productos:id_producto(nombre, id_categoria))
        `)
        .eq("estado", "completada")
        .gte("created_at", fechaInicio.toISOString());
      
      if (vError) throw vError;
      setVentas(vData || []);

    } catch (err: any) {
      console.error(err);
      setDbError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Kpis ---
  const totalIngresos = ventas.reduce((s, v) => s + Number(v.total), 0);
  const totalVentas = ventas.length;
  const ticketPromedio = totalVentas > 0 ? totalIngresos / totalVentas : 0;
  
  // Metodos de pago
  const metodos = ventas.reduce((acc, v) => {
    acc[v.metodo_pago] = (acc[v.metodo_pago] || 0) + Number(v.total);
    return acc;
  }, {} as Record<string, number>);

  // Productos mas vendidos
  const productosMap = new Map<string, { nombre: string, cantidad: number, subtotal: number }>();
  ventas.forEach(v => {
    (v.venta_items || []).forEach((item: any) => {
      const prod = Array.isArray(item.productos) ? item.productos[0] : item.productos;
      if (!prod) return;
      const key = prod.nombre;
      const current = productosMap.get(key) || { nombre: key, cantidad: 0, subtotal: 0 };
      current.cantidad += Number(item.cantidad);
      current.subtotal += Number(item.subtotal);
      productosMap.set(key, current);
    });
  });
  const topProductos = Array.from(productosMap.values()).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

  if (loading) {
    return (<div className="flex flex-col items-center justify-center py-24 text-billanga-gray"><RefreshCw className="w-10 h-10 animate-spin text-billanga-primary mb-4" /><p className="text-sm">Generando reportes...</p></div>);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart3 className="w-7 h-7 text-billanga-primary" /> Reportes & Estadísticas</h2>
          <p className="text-sm text-billanga-gray">Métricas financieras y rendimiento de ventas de la sucursal.</p>
        </div>
        <div className="flex gap-2">
          <select value={rangoFechas} onChange={e => setRangoFechas(e.target.value)} className="bg-black/40 border border-[#2a2a2c] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-billanga-primary">
            <option value="hoy">Hoy</option><option value="semana">Últimos 7 días</option><option value="mes">Último mes</option><option value="año">Último año</option>
          </select>
          <button onClick={loadData} className="p-2 border border-[#2a2a2c] hover:bg-[#2a2a2c] text-white rounded-lg transition-all"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {dbError && (<div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-start gap-3"><AlertTriangle className="w-6 h-6 shrink-0" /><div><h4 className="font-bold text-white">Error</h4><p className="text-sm">{dbError}</p></div></div>)}

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1c] border border-[#2a2a2c] rounded-xl p-5">
          <div className="flex items-center gap-3"><div className="p-3 bg-green-500/10 rounded-xl"><TrendingUp className="w-6 h-6 text-green-500" /></div><div><p className="text-xs text-billanga-gray uppercase tracking-wider">Ingresos Totales</p><p className="text-2xl font-black text-white mt-1">Bs. {totalIngresos.toFixed(2)}</p></div></div>
        </div>
        <div className="bg-[#1a1a1c] border border-[#2a2a2c] rounded-xl p-5">
          <div className="flex items-center gap-3"><div className="p-3 bg-blue-500/10 rounded-xl"><ShoppingBag className="w-6 h-6 text-blue-400" /></div><div><p className="text-xs text-billanga-gray uppercase tracking-wider">Total Ventas</p><p className="text-2xl font-black text-white mt-1">{totalVentas}</p></div></div>
        </div>
        <div className="bg-[#1a1a1c] border border-[#2a2a2c] rounded-xl p-5">
          <div className="flex items-center gap-3"><div className="p-3 bg-purple-500/10 rounded-xl"><Banknote className="w-6 h-6 text-purple-400" /></div><div><p className="text-xs text-billanga-gray uppercase tracking-wider">Ticket Promedio</p><p className="text-2xl font-black text-white mt-1">Bs. {ticketPromedio.toFixed(2)}</p></div></div>
        </div>
        <div className="bg-[#1a1a1c] border border-[#2a2a2c] rounded-xl p-5 flex flex-col justify-center gap-2">
           <button className="flex items-center justify-center gap-2 w-full py-2 bg-billanga-primary/10 text-billanga-primary border border-billanga-primary/20 hover:bg-billanga-primary hover:text-white rounded-lg text-sm font-bold transition-all">
             <Download className="w-4 h-4" /> Exportar CSV
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos Top */}
        <div className="bg-[#1a1a1c] border border-[#2a2a2c] rounded-xl p-6">
          <h3 className="font-bold text-white text-base mb-4">Productos Más Vendidos</h3>
          <div className="space-y-4">
            {topProductos.length > 0 ? topProductos.map((p, i) => (
              <div key={i} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-[#2a2a2c]/50">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-[#2a2a2c] text-xs font-bold flex items-center justify-center text-billanga-gray">{i + 1}</div>
                  <span className="text-sm font-bold text-white">{p.nombre}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-billanga-primary">{p.cantidad} und.</div>
                  <div className="text-xs text-billanga-gray">Bs. {p.subtotal.toFixed(2)}</div>
                </div>
              </div>
            )) : (
               <div className="py-8 text-center text-billanga-gray/50 text-sm">No hay datos de productos en este periodo.</div>
            )}
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="bg-[#1a1a1c] border border-[#2a2a2c] rounded-xl p-6">
          <h3 className="font-bold text-white text-base mb-4">Ingresos por Método de Pago</h3>
          <div className="space-y-4">
             {Object.entries(metodos).length > 0 ? Object.entries(metodos).sort((a: [string, any], b: [string, any]) => (b[1] as number) - (a[1] as number)).map(([metodo, monto]: [string, any], i) => {
               const percentage = ((monto / totalIngresos) * 100).toFixed(1);
               return (
                 <div key={i} className="space-y-1">
                   <div className="flex justify-between text-sm">
                     <span className="capitalize text-white font-bold">{metodo}</span>
                     <span className="text-billanga-gray">Bs. {monto.toFixed(2)} <span className="text-xs ml-1">({percentage}%)</span></span>
                   </div>
                   <div className="w-full bg-[#2a2a2c] rounded-full h-2">
                     <div className="bg-billanga-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                   </div>
                 </div>
               );
             }) : (
               <div className="py-8 text-center text-billanga-gray/50 text-sm">No hay datos financieros en este periodo.</div>
             )}
          </div>
        </div>
      </div>

    </div>
  );
}
