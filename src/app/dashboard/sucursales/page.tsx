"use client";

import { useState, useEffect } from "react";
import {
  Building2, MapPin, Phone, RefreshCw, AlertTriangle,
  PlusCircle, Edit3, X, Save, Check
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Sucursal {
  id_sucursal: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  activo: boolean;
  created_at: string;
}

export default function SucursalesPage() {
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState("");
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null);
  const [formData, setFormData] = useState({ nombre: "", direccion: "", telefono: "" });

  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setDbError("");
    try {
      const { data, error } = await supabase.from("sucursales").select("*").order("created_at");
      if (error) throw error;
      setSucursales(data || []);
    } catch (err: any) {
      console.error(err);
      setDbError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingSucursal(null);
    setFormData({ nombre: "", direccion: "", telefono: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (suc: Sucursal) => {
    setEditingSucursal(suc);
    setFormData({ nombre: suc.nombre, direccion: suc.direccion || "", telefono: suc.telefono || "" });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre) { alert("El nombre es obligatorio"); return; }
    try {
      if (editingSucursal) {
        await supabase.from("sucursales").update({
          nombre: formData.nombre, direccion: formData.direccion || null, telefono: formData.telefono || null
        }).eq("id_sucursal", editingSucursal.id_sucursal);
      } else {
        await supabase.from("sucursales").insert({
          nombre: formData.nombre, direccion: formData.direccion || null, telefono: formData.telefono || null
        });
      }
      setIsModalOpen(false);
      setEditingSucursal(null);
      loadData();
    } catch (err: any) { alert("Error al guardar: " + err.message); }
  };

  const handleToggleActivo = async (suc: Sucursal) => {
    try {
      await supabase.from("sucursales").update({ activo: !suc.activo }).eq("id_sucursal", suc.id_sucursal);
      loadData();
    } catch (err: any) { alert("Error: " + err.message); }
  };

  if (loading) {
    return (<div className="flex flex-col items-center justify-center py-24 text-malandro-gray"><RefreshCw className="w-10 h-10 animate-spin text-malandro-red mb-4" /><p className="text-sm">Cargando sucursales...</p></div>);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Building2 className="w-7 h-7 text-malandro-red" /> Gestión de Sucursales</h2>
          <p className="text-sm text-malandro-gray">Administra las ubicaciones físicas de tu negocio.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 border border-[#2a2a2c] hover:bg-[#2a2a2c] text-white rounded-lg text-sm transition-all"><RefreshCw className="w-4 h-4" /> Refrescar</button>
          <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-malandro-red hover:bg-malandro-red-dark text-white rounded-lg text-sm font-bold transition-all"><PlusCircle className="w-4 h-4" /> Nueva Sucursal</button>
        </div>
      </div>

      {dbError && (<div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-start gap-3"><AlertTriangle className="w-6 h-6 shrink-0" /><div><h4 className="font-bold text-white">Error</h4><p className="text-sm">{dbError}</p></div></div>)}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sucursales.map(suc => (
          <div key={suc.id_sucursal} className="bg-[#1a1a1c] border border-[#2a2a2c] rounded-xl p-5 relative overflow-hidden group">
            {!suc.activo && <div className="absolute inset-0 bg-black/50 z-10"></div>}
            <div className="flex justify-between items-start relative z-20">
              <div>
                <h3 className="font-bold text-xl text-white">{suc.nombre}</h3>
                <div className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${suc.activo ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-400"}`}>
                  {suc.activo ? "Activa" : "Inactiva"}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleToggleActivo(suc)} className="p-1.5 hover:bg-[#2a2a2c] rounded-lg text-malandro-gray transition-all" title={suc.activo ? "Desactivar" : "Activar"}>
                  <AlertTriangle className="w-4 h-4" />
                </button>
                <button onClick={() => handleOpenEdit(suc)} className="p-1.5 hover:bg-[#2a2a2c] rounded-lg text-malandro-gray transition-all">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-6 space-y-3 relative z-20">
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-malandro-gray shrink-0 mt-0.5" />
                <span className="text-malandro-gray">{suc.direccion || "Sin dirección registrada"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-malandro-gray shrink-0" />
                <span className="text-malandro-gray">{suc.telefono || "Sin teléfono"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1c] border border-[#2a2a2c] w-full max-w-md rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#2a2a2c] flex justify-between items-center"><h3 className="font-bold text-lg text-white">{editingSucursal ? "Editar Sucursal" : "Nueva Sucursal"}</h3><button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#2a2a2c] rounded-full text-malandro-gray"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="text-sm font-medium text-malandro-gray block mb-1">Nombre de Sucursal *</label><input type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej: Sede Norte" className="w-full bg-black/40 border border-[#2a2a2c] rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-malandro-red" /></div>
              <div><label className="text-sm font-medium text-malandro-gray block mb-1">Dirección</label><textarea rows={2} value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} placeholder="Calle..." className="w-full bg-black/40 border border-[#2a2a2c] rounded-lg py-2.5 px-3 text-white placeholder:text-malandro-gray/50 focus:outline-none focus:border-malandro-red text-sm" /></div>
              <div><label className="text-sm font-medium text-malandro-gray block mb-1">Teléfono</label><input type="text" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} placeholder="Ej: 555-1234" className="w-full bg-black/40 border border-[#2a2a2c] rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-malandro-red" /></div>
            </div>
            <div className="p-6 border-t border-[#2a2a2c] bg-black/20 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-[#2a2a2c] hover:bg-[#2a2a2c] text-white font-bold text-sm">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg bg-malandro-red hover:bg-malandro-red-dark text-white font-bold text-sm flex items-center justify-center gap-2"><Save className="w-4 h-4" /> {editingSucursal ? "Guardar" : "Crear"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
