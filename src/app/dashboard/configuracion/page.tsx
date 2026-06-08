"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Bell, DollarSign, Check, Info, AlertTriangle, RefreshCw, Plus, Edit2, Trash2, X, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dbError, setDbError] = useState("");

  const [configId, setConfigId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [billarName, setBillarName] = useState("Billanga");
  const [hourlyRate, setHourlyRate] = useState(30.00);
  const [currency, setCurrency] = useState("Bs.");
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [autoPrint, setAutoPrint] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Estados para Tarifas
  const [activeSucursalId, setActiveSucursalId] = useState("");
  const [tarifas, setTarifas] = useState<any[]>([]);
  const [isTarifaModalOpen, setIsTarifaModalOpen] = useState(false);
  const [editingTarifa, setEditingTarifa] = useState<any>(null);
  const [tarifaForm, setTarifaForm] = useState({ nombre: "", precio_hora: 0, tipo_dia: "todos", horas_pagadas: 0, horas_regalo: 0 });

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
        const { data: dbUser } = await supabase.from("usuarios").select("*, roles(nivel)").eq("auth_id", user.id).single();
        setCurrentUser(dbUser);
      }

      // 1.5 Obtener Sucursal y Tarifas
      const { data: sucursales } = await supabase.from("sucursales").select("id_sucursal");
      const sucursalId = sucursales?.[0]?.id_sucursal || "";
      setActiveSucursalId(sucursalId);
      
      if (sucursalId) {
        const { data: tarifasData } = await supabase.from("tarifas").select("*").eq("id_sucursal", sucursalId).order("created_at");
        setTarifas(tarifasData || []);
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

  const handleSaveTarifa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSucursalId) return;
    
    try {
      if (editingTarifa) {
        await supabase.from("tarifas").update({
          nombre: tarifaForm.nombre,
          precio_hora: tarifaForm.precio_hora,
          tipo_dia: tarifaForm.tipo_dia,
          horas_pagadas: tarifaForm.horas_pagadas || 0,
          horas_regalo: tarifaForm.horas_regalo || 0
        }).eq("id_tarifa", editingTarifa.id_tarifa);
      } else {
        await supabase.from("tarifas").insert([{
          id_sucursal: activeSucursalId,
          nombre: tarifaForm.nombre,
          precio_hora: tarifaForm.precio_hora,
          tipo_dia: tarifaForm.tipo_dia,
          horas_pagadas: tarifaForm.horas_pagadas || 0,
          horas_regalo: tarifaForm.horas_regalo || 0,
          activo: true
        }]);
      }
      
      // Recargar tarifas
      const { data } = await supabase.from("tarifas").select("*").eq("id_sucursal", activeSucursalId).order("created_at");
      setTarifas(data || []);
      setIsTarifaModalOpen(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setDbError(err.message);
    }
  };

  const handleToggleTarifaActive = async (id: string, currentStatus: boolean) => {
    try {
      await supabase.from("tarifas").update({ activo: !currentStatus }).eq("id_tarifa", id);
      setTarifas(tarifas.map(t => t.id_tarifa === id ? { ...t, activo: !currentStatus } : t));
    } catch (err: any) {
      setDbError(err.message);
    }
  };

  const userLevel = currentUser?.roles?.nivel || 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-billanga-gray">
        <RefreshCw className="w-10 h-10 animate-spin text-billanga-primary mb-4" />
        <p className="text-sm">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-billanga-primary" />
          Configuración del Sistema
        </h2>
        <p className="text-sm text-billanga-gray">Ajusta los parámetros operativos y preferencias generales de la sucursal.</p>
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
              <DollarSign className="w-5 h-5 text-billanga-primary" />
              Operaciones de Mesa
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-billanga-gray uppercase tracking-wider mb-2">
                  Nombre del Establecimiento
                </label>
                <input 
                  type="text" 
                  value={billarName}
                  onChange={(e) => setBillarName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#121212] border border-[#2a2a2c] rounded-xl text-white text-sm focus:border-billanga-primary focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-billanga-gray uppercase tracking-wider mb-2">
                    Moneda Local
                  </label>
                  <input 
                    type="text" 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#121212] border border-[#2a2a2c] rounded-xl text-white text-sm focus:border-billanga-primary focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferencias del Sistema */}
          <div className="bg-[#1a1a1c] border border-[#2a2a2c] rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#2a2a2c] pb-3">
              <Bell className="w-5 h-5 text-billanga-primary" />
              Notificaciones y Preferencias
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-black/25 rounded-xl border border-[#2a2a2c]/60">
                <div>
                  <h4 className="text-sm font-semibold text-white">Alertas Sonoras</h4>
                  <p className="text-xs text-billanga-gray">Emitir sonidos en POS y al abrir/cerrar mesas.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={soundsEnabled}
                    onChange={(e) => setSoundsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-billanga-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-black/25 rounded-xl border border-[#2a2a2c]/60">
                <div>
                  <h4 className="text-sm font-semibold text-white">Impresión Automática</h4>
                  <p className="text-xs text-billanga-gray">Imprimir factura POS inmediatamente al cobrar.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoPrint}
                    onChange={(e) => setAutoPrint(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-billanga-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-black/25 rounded-xl border border-[#2a2a2c]/60">
                <div>
                  <h4 className="text-sm font-semibold text-white">Modo Nocturno</h4>
                  <p className="text-xs text-billanga-gray">Mantener estética oscura premium del dashboard.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={darkMode}
                    disabled
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-850 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all bg-billanga-primary opacity-60 cursor-not-allowed"></div>
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Gestor de Tarifas */}
        <div className="bg-[#1a1a1c] border border-[#2a2a2c] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#2a2a2c] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-billanga-primary" />
                Gestión de Tarifas de Juego
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingTarifa(null);
                  setTarifaForm({ nombre: "", precio_hora: 0, tipo_dia: "todos", horas_pagadas: 0, horas_regalo: 0 });
                  setIsTarifaModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-billanga-primary/20 text-billanga-primary hover:bg-billanga-primary hover:text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" /> Nueva Tarifa
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div key={tarifa.id_tarifa} className={`p-4 rounded-xl border transition-all ${tarifa.activo ? 'bg-[#121212] border-[#2a2a2c]' : 'bg-black/20 border-red-500/20 opacity-70'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">{tarifa.nombre}</h4>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setEditingTarifa(tarifa); setTarifaForm({ nombre: tarifa.nombre, precio_hora: Number(tarifa.precio_hora), tipo_dia: tarifa.tipo_dia, horas_pagadas: Number(tarifa.horas_pagadas || 0), horas_regalo: Number(tarifa.horas_regalo || 0) }); setIsTarifaModalOpen(true); }} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => handleToggleTarifaActive(tarifa.id_tarifa, tarifa.activo)} className={`p-1.5 rounded-lg transition-colors ${tarifa.activo ? 'bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>
                        {tarifa.activo ? <Trash2 className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-billanga-primary mb-1">
                    {currency} {Number(tarifa.precio_hora).toFixed(2)} <span className="text-xs text-billanga-gray font-normal">/ hora</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-xs text-billanga-gray bg-zinc-800/50 inline-block px-2 py-1 rounded w-fit">
                      Aplicación: {tarifa.tipo_dia.toUpperCase()}
                    </span>
                    {(tarifa.horas_regalo > 0) && (
                      <span className="text-xs font-bold text-green-400 bg-green-500/10 inline-block px-2 py-1 rounded w-fit">
                        🎁 Promo: Paga {tarifa.horas_pagadas}h, Juega {tarifa.horas_pagadas + tarifa.horas_regalo}h
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {tarifas.length === 0 && (
                <div className="col-span-full py-8 text-center text-billanga-gray border border-dashed border-[#2a2a2c] rounded-xl bg-black/20">
                  <p>No hay tarifas registradas.</p>
                </div>
              )}
            </div>
          </div>

        {/* Modal de Tarifa */}
        {isTarifaModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1c] border border-[#2a2a2c] rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-[#2a2a2c] flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{editingTarifa ? 'Editar Tarifa' : 'Nueva Tarifa'}</h3>
                <button type="button" onClick={() => setIsTarifaModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-billanga-gray uppercase mb-2">Nombre de Tarifa</label>
                  <input type="text" value={tarifaForm.nombre} onChange={e => setTarifaForm({...tarifaForm, nombre: e.target.value})} className="w-full px-4 py-3 bg-[#121212] border border-[#2a2a2c] rounded-xl text-white text-sm focus:border-billanga-primary focus:outline-none" placeholder="Ej: Tarifa Normal" autoFocus required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-billanga-gray uppercase mb-2">Precio por Hora</label>
                    <input type="number" step="0.5" value={tarifaForm.precio_hora} onChange={e => setTarifaForm({...tarifaForm, precio_hora: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 bg-[#121212] border border-[#2a2a2c] rounded-xl text-white text-sm focus:border-billanga-primary focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-billanga-gray uppercase mb-2">Aplicación</label>
                    <select value={tarifaForm.tipo_dia} onChange={e => setTarifaForm({...tarifaForm, tipo_dia: e.target.value})} className="w-full px-4 py-3 bg-[#121212] border border-[#2a2a2c] rounded-xl text-white text-sm focus:border-billanga-primary focus:outline-none">
                      <option value="todos">Todos los Días</option>
                      <option value="l-v">Lunes a Viernes</option>
                      <option value="fin-de-semana">Fin de Semana</option>
                      <option value="feriado">Feriado</option>
                    </select>
                  </div>
                </div>
                <div className="border-t border-[#2a2a2c] pt-4 mt-4">
                  <h4 className="text-sm font-bold text-white mb-3">🎁 Configuración de Promoción (Opcional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-billanga-gray uppercase mb-1">Horas que Paga</label>
                      <input type="number" min="0" value={tarifaForm.horas_pagadas} onChange={e => setTarifaForm({...tarifaForm, horas_pagadas: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 bg-[#121212] border border-[#2a2a2c] rounded-xl text-white text-sm focus:border-billanga-primary focus:outline-none" placeholder="Ej: 2" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-billanga-gray uppercase mb-1">Horas de Regalo</label>
                      <input type="number" min="0" value={tarifaForm.horas_regalo} onChange={e => setTarifaForm({...tarifaForm, horas_regalo: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 bg-[#121212] border border-[#2a2a2c] rounded-xl text-white text-sm focus:border-billanga-primary focus:outline-none" placeholder="Ej: 1" />
                    </div>
                  </div>
                  <p className="text-[10px] text-billanga-gray mt-2">
                    Ejemplo para 3x2 (juega 3, paga 2): Horas que Paga = 2, Horas de Regalo = 1. Si no hay promoción, deja ambos en 0.
                  </p>
                </div>
              </div>
              <div className="p-5 border-t border-[#2a2a2c] flex gap-3 justify-end bg-black/20">
                <button type="button" onClick={() => setIsTarifaModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="button" onClick={handleSaveTarifa} className="px-5 py-2.5 rounded-xl font-bold bg-billanga-primary text-white hover:bg-[#b81d24] transition-colors shadow-lg shadow-billanga-primary/20">
                  {editingTarifa ? 'Guardar Cambios' : 'Crear Tarifa'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-billanga-primary/5 border border-billanga-primary/10 rounded-xl flex gap-3 text-xs text-billanga-gray">
          <Info className="w-5 h-5 text-billanga-primary shrink-0" />
          <p className="leading-relaxed">
            Las tarifas y parámetros de cobro configurados aquí afectan en tiempo real al Punto de Venta (POS) y a la facturación del panel de control de mesas en juego. Asegúrate de guardar los cambios antes de salir.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-billanga-primary hover:bg-[#b81d24] text-white rounded-xl text-sm font-bold shadow-lg shadow-billanga-primary/10 transition-colors disabled:opacity-50"
        >
          <Save className="w-4.5 h-4.5" />
          {saving ? "Guardando Ajustes..." : "Guardar Configuración"}
        </button>
      </form>
    </div>
  );
}

