"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Bell, DollarSign, Check, Info, AlertTriangle, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dbError, setDbError] = useState("");

  const [configId, setConfigId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [billarName, setBillarName] = useState("Billar El Malandro");
  const [hourlyRate, setHourlyRate] = useState(30.00);
  const [currency, setCurrency] = useState("Bs.");
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [autoPrint, setAutoPrint] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    setDbError("");
    try {
      // 1. Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: dbUser } = await supabase.from("usuarios").select("id_usuario").eq("auth_id", user.id).single();
        setCurrentUser(dbUser);
      }

      // 2. Cargar configuración (idealmente filtrada por usuario o sucursal, aquí tomamos la primera o la del usuario si aplica)
      const { data, error } = await supabase
        .from("configuracion")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        if (error.code === '42P01') {
          // Tabla no existe
          setDbError("La tabla 'configuracion' no existe en la base de datos. Por favor, ejecuta el script SQL.");
        } else {
          setDbError(error.message);
        }
      } else if (data) {
        setConfigId(data.id_configuracion);
        setBillarName(data.nombre_negocio);
        setCurrency(data.moneda);
        setHourlyRate(Number(data.tarifa_hora_mesa));
        setSoundsEnabled(data.sonidos_activados);
        setAutoPrint(data.impresion_automatica);
        setDarkMode(data.modo_nocturno);
      } else {
        // No hay configuración, usaremos los valores por defecto y al guardar se hará un INSERT
      }
    } catch (err: any) {
      console.error(err);
      setDbError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setDbError("");

    try {
      const configData: any = {
        nombre_negocio: billarName,
        moneda: currency,
        tarifa_hora_mesa: hourlyRate,
        sonidos_activados: soundsEnabled,
        impresion_automatica: autoPrint,
        modo_nocturno: darkMode
      };

      if (currentUser) {
        configData.id_usuario = currentUser.id_usuario;
      }

      if (configId) {
        // Actualizar
        const { error } = await supabase
          .from("configuracion")
          .update(configData)
          .eq("id_configuracion", configId);
        
        if (error) throw error;
      } else {
        // Insertar por primera vez
        const { data, error } = await supabase
          .from("configuracion")
          .insert([configData])
          .select()
          .single();
        
        if (error) throw error;
        if (data) setConfigId(data.id_configuracion);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error al guardar:", err);
      setDbError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-malandro-gray">
        <RefreshCw className="w-10 h-10 animate-spin text-malandro-red mb-4" />
        <p className="text-sm">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-malandro-red" />
          Configuración del Sistema
        </h2>
        <p className="text-sm text-malandro-gray">Ajusta los parámetros operativos y preferencias generales de la sucursal.</p>
      </div>

      {dbError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-white">Error de Base de Datos</h4>
            <p className="text-sm">{dbError}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Check className="w-5 h-5 text-green-500 shrink-0" />
          <span className="text-sm font-semibold">¡Ajustes guardados correctamente!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Parámetros Operativos */}
          <div className="bg-[#1a1a1c] border border-[#2a2a2c] rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#2a2a2c] pb-3">
              <DollarSign className="w-5 h-5 text-malandro-red" />
              Operaciones de Mesa
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-malandro-gray uppercase tracking-wider mb-2">
                  Nombre del Establecimiento
                </label>
                <input 
                  type="text" 
                  value={billarName}
                  onChange={(e) => setBillarName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#121212] border border-[#2a2a2c] rounded-xl text-white text-sm focus:border-malandro-red focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-malandro-gray uppercase tracking-wider mb-2">
                    Moneda Local
                  </label>
                  <input 
                    type="text" 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#121212] border border-[#2a2a2c] rounded-xl text-white text-sm focus:border-malandro-red focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-malandro-gray uppercase tracking-wider mb-2">
                    Tarifa Hora Mesa (Padrón)
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-[#121212] border border-[#2a2a2c] rounded-xl text-white text-sm focus:border-malandro-red focus:outline-none transition-colors font-mono"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferencias del Sistema */}
          <div className="bg-[#1a1a1c] border border-[#2a2a2c] rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#2a2a2c] pb-3">
              <Bell className="w-5 h-5 text-malandro-red" />
              Notificaciones y Preferencias
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-black/25 rounded-xl border border-[#2a2a2c]/60">
                <div>
                  <h4 className="text-sm font-semibold text-white">Alertas Sonoras</h4>
                  <p className="text-xs text-malandro-gray">Emitir sonidos en POS y al abrir/cerrar mesas.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={soundsEnabled}
                    onChange={(e) => setSoundsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-malandro-red"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-black/25 rounded-xl border border-[#2a2a2c]/60">
                <div>
                  <h4 className="text-sm font-semibold text-white">Impresión Automática</h4>
                  <p className="text-xs text-malandro-gray">Imprimir factura POS inmediatamente al cobrar.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoPrint}
                    onChange={(e) => setAutoPrint(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-malandro-red"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-black/25 rounded-xl border border-[#2a2a2c]/60">
                <div>
                  <h4 className="text-sm font-semibold text-white">Modo Nocturno</h4>
                  <p className="text-xs text-malandro-gray">Mantener estética oscura premium del dashboard.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={darkMode}
                    disabled
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-850 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all bg-malandro-red opacity-60 cursor-not-allowed"></div>
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Info Box */}
        <div className="p-4 bg-malandro-red/5 border border-malandro-red/10 rounded-xl flex gap-3 text-xs text-malandro-gray">
          <Info className="w-5 h-5 text-malandro-red shrink-0" />
          <p className="leading-relaxed">
            Las tarifas y parámetros de cobro configurados aquí afectan en tiempo real al Punto de Venta (POS) y a la facturación del panel de control de mesas en juego. Asegúrate de guardar los cambios antes de salir.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-malandro-red hover:bg-[#b81d24] text-white rounded-xl text-sm font-bold shadow-lg shadow-malandro-red/10 transition-colors disabled:opacity-50"
        >
          <Save className="w-4.5 h-4.5" />
          {saving ? "Guardando Ajustes..." : "Guardar Configuración"}
        </button>
      </form>
    </div>
  );
}

