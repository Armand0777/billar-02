"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomDock from "@/components/BottomDock";
import Link from "next/link";
import { ArrowLeft, RefreshCw, MapPin, CheckCircle, XCircle, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Sucursal {
  id_sucursal: string;
  nombre: string;
}

interface Mesa {
  id_mesa: string;
  numero: number;
  nombre: string | null;
  tipo: string;
  id_sucursal: string;
}

const TIPO_LABELS: Record<string, string> = {
  pool: "Pool",
  snooker: "Snooker",
  americana: "Americana",
  carambola: "Carambola",
  cacho: "Cacho / Dados",
};

export default function MesasDisponiblesPage() {
  const supabase = createClient();
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [sesionesAbiertas, setSesionesAbiertas] = useState<Set<string>>(new Set());
  const [activeSucursalId, setActiveSucursalId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Solo actualiza qué sesiones están abiertas (liviano, cada 30 s)
  const refreshSesiones = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    const { data } = await supabase
      .from("sesiones_mesa")
      .select("id_mesa")
      .eq("estado", "abierta");
    if (data) {
      setSesionesAbiertas(new Set(data.map((s) => s.id_mesa)));
      setLastUpdated(new Date());
    }
    if (!silent) setRefreshing(false);
  }, [supabase]);

  // Carga inicial completa
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: sucData, error: sucErr } = await supabase
        .from("sucursales")
        .select("id_sucursal, nombre")
        .order("nombre");


      const primeraId = sucData?.[0]?.id_sucursal ?? "";
      if (sucData) setSucursales(sucData);
      if (primeraId) setActiveSucursalId(primeraId);

      const { data: mesasData, error: mesasErr } = await supabase
        .from("mesas")
        .select("id_mesa, numero, nombre, tipo, id_sucursal")
        .eq("activo", true)
        .order("numero");


      if (mesasData) setMesas(mesasData);

      const { data: sesData, error: sesErr } = await supabase
        .from("sesiones_mesa")
        .select("id_mesa")
        .eq("estado", "abierta");


      if (sesData) setSesionesAbiertas(new Set(sesData.map((s) => s.id_mesa)));

      setLastUpdated(new Date());
      setLoading(false);
    };

    load();

    // Refresca solo las sesiones cada 30 s para ver cambios en tiempo real
    const interval = setInterval(() => refreshSesiones(true), 30000);
    return () => clearInterval(interval);
  }, [refreshSesiones]);

  const mesasDeEsta = mesas.filter((m) => m.id_sucursal === activeSucursalId);

  // Agrupa por tipo
  const porTipo = mesasDeEsta.reduce<Record<string, Mesa[]>>((acc, mesa) => {
    const key = mesa.tipo || "pool";
    if (!acc[key]) acc[key] = [];
    acc[key].push(mesa);
    return acc;
  }, {});

  const totalLibres = mesasDeEsta.filter((m) => !sesionesAbiertas.has(m.id_mesa)).length;
  const totalOcupadas = mesasDeEsta.length - totalLibres;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-6 pt-32 pb-24 w-full">

        {/* Volver + Actualizar */}
        <div className="mb-8 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center text-billanga-primary hover:text-white transition-colors gap-2 text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {lastUpdated.toLocaleTimeString("es-BO", { timeZone: "America/La_Paz", hour: "2-digit", minute: "2-digit", hour12: true })}
              </span>
            )}
            <button
              onClick={() => refreshSesiones(false)}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#121212] border border-[#2a2a2c] rounded-xl text-sm font-bold hover:bg-[#1a1a1c] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>
        </div>

        <div className="space-y-8">

          {/* Título */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-billanga-primary to-green-400">
              Disponibilidad de Mesas
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">
              Consulta en tiempo real qué mesas están libres y ven a jugar sin hacer fila.
            </p>
          </div>

          {/* Selector de Sucursal */}
          {sucursales.length > 1 && (
            <div className="flex justify-center gap-3 flex-wrap">
              {sucursales.map((s) => (
                <button
                  key={s.id_sucursal}
                  onClick={() => setActiveSucursalId(s.id_sucursal)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                    activeSucursalId === s.id_sucursal
                      ? "bg-billanga-primary text-white shadow-[0_0_20px_rgba(0,230,118,0.3)]"
                      : "bg-[#121212] border border-[#2a2a2c] text-gray-400 hover:text-white hover:border-billanga-primary/40"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  {s.nombre}
                </button>
              ))}
            </div>
          )}

          {/* Contadores */}
          {!loading && mesasDeEsta.length > 0 && (
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 px-5 py-2.5 bg-green-500/10 border border-green-500/20 rounded-2xl">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <span className="text-green-400 font-black text-lg">{totalLibres}</span>
                <span className="text-green-400/70 text-sm font-medium">Disponibles</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-red-400 font-black text-lg">{totalOcupadas}</span>
                <span className="text-red-400/70 text-sm font-medium">Ocupadas</span>
              </div>
            </div>
          )}

          {/* Grid de Mesas */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-10 h-10 border-4 border-billanga-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : mesasDeEsta.length === 0 ? (
            <div className="text-center py-20 bg-[#111] rounded-3xl border border-[#2a2a2c]">
              <p className="text-gray-500">No hay mesas registradas en esta sucursal.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(porTipo).map(([tipo, listaMesas]) => (
                <div key={tipo}>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 pl-1">
                    {TIPO_LABELS[tipo] || tipo}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {listaMesas.map((mesa) => {
                      const ocupada = sesionesAbiertas.has(mesa.id_mesa);
                      return (
                        <div
                          key={mesa.id_mesa}
                          className={`relative p-5 rounded-2xl border flex flex-col items-center justify-center min-h-[130px] transition-all duration-300 ${
                            ocupada
                              ? "bg-[#1a1111] border-red-900/40"
                              : "bg-[#111a14] border-green-900/40 hover:border-billanga-primary/50 hover:bg-[#14221a]"
                          }`}
                        >
                          {/* Indicador */}
                          <div className="absolute top-3 right-3">
                            {ocupada ? (
                              <span className="flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                              </span>
                            ) : (
                              <span className="flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                              </span>
                            )}
                          </div>

                          <span className="text-3xl font-black text-white mb-1">
                            {mesa.nombre ? mesa.nombre.replace(/mesa\s*/i, "M-") : `M-${mesa.numero}`}
                          </span>

                          <span className={`mt-2 flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                            ocupada
                              ? "bg-red-500/10 text-red-400"
                              : "bg-green-500/10 text-green-400"
                          }`}>
                            {ocupada ? (
                              <><XCircle className="w-3 h-3" /> OCUPADA</>
                            ) : (
                              <><CheckCircle className="w-3 h-3" /> LIBRE</>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA WhatsApp */}
          <div className="pt-6 flex justify-center">
            <a
              href="https://wa.me/59172665231"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 bg-billanga-primary hover:bg-billanga-primary/90 text-white rounded-2xl font-black text-base transition-all shadow-[0_0_25px_rgba(0,230,118,0.25)] hover:scale-105 active:scale-95"
            >
              ¡Reserva tu mesa por WhatsApp!
            </a>
          </div>

        </div>
      </main>

      <Footer />
      <BottomDock />
    </div>
  );
}
