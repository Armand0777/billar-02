"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users, Search, RefreshCw, AlertTriangle,
  Award, Edit, X, UserCheck, ChevronLeft, ChevronRight
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/lib/database.types";

type Cliente = Database["public"]["Tables"]["clientes"]["Row"];

const PAGE_SIZE = 20;

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentCliente, setCurrentCliente] = useState<Cliente | null>(null);
  const [editPuntos, setEditPuntos] = useState("");
  const [newCliente, setNewCliente] = useState({ nombre: "", email: "", telefono: "" });

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // Debounce de búsqueda: 400ms después de que el usuario deja de escribir
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  // Cargar clientes cuando cambia la página o la búsqueda
  useEffect(() => {
    loadClientes(page, debouncedSearch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  const loadClientes = async (currentPage: number, search: string) => {
    setLoading(true);
    setDbError("");
    try {
      let query = supabase
        .from("clientes")
        .select("*", { count: "exact" })
        .order("puntos_fidelidad", { ascending: false });

      if (search.trim()) {
        query = query.or(
          `nombre.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`
        );
      }

      const from = currentPage * PAGE_SIZE;
      const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);

      if (error) throw error;
      setClientes(data || []);
      setTotalCount(count ?? 0);
    } catch (err: unknown) {
      setDbError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePuntos = async () => {
    if (!currentCliente) return;
    try {
      const newPuntos = parseInt(editPuntos);
      if (isNaN(newPuntos) || newPuntos < 0) {
        alert("Puntos inválidos");
        return;
      }
      const { error } = await supabase
        .from("clientes")
        .update({ puntos_fidelidad: newPuntos })
        .eq("id_cliente", currentCliente.id_cliente);
      if (error) throw error;

      setIsEditing(false);
      setCurrentCliente(null);
      setEditPuntos("");
      loadClientes(page, debouncedSearch);
    } catch (err: unknown) {
      alert("Error: " + (err instanceof Error ? err.message : "Error desconocido"));
    }
  };

  const handleCreateCliente = async () => {
    if (!newCliente.nombre) {
      alert("El nombre es obligatorio");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("clientes")
        .insert({
          nombre: newCliente.nombre,
          email: newCliente.email || null,
          telefono: newCliente.telefono || null,
          activo: true,
          puntos_fidelidad: 0,
        })
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No se pudo crear el cliente por permisos o conflicto.");

      setIsCreating(false);
      setNewCliente({ nombre: "", email: "", telefono: "" });
      loadClientes(0, debouncedSearch);
      setPage(0);
    } catch (err: unknown) {
      alert("Error al crear cliente: " + (err instanceof Error ? err.message : "Error desconocido"));
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-billanga-primary" />
            Gestión de Clientes
          </h2>
          <p className="text-sm text-billanga-gray">
            Directorio de clientes registrados y programa de fidelidad.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-billanga-gray" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#1a1a1c] border border-[#2a2a2c] rounded-xl text-sm focus:outline-none focus:border-billanga-primary text-white w-full md:w-64 transition-all"
            />
          </div>
          <button
            onClick={() => loadClientes(page, debouncedSearch)}
            className="p-2 border border-[#2a2a2c] hover:bg-[#2a2a2c] text-white rounded-xl transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-billanga-primary hover:bg-billanga-primary-dark text-white rounded-xl text-sm font-bold transition-all whitespace-nowrap"
          >
            Nuevo Cliente
          </button>
        </div>
      </div>

      {dbError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="font-bold text-white">Error</h4>
            <p className="text-sm">{dbError}</p>
          </div>
        </div>
      )}

      {/* Grid de Clientes */}
      <div className="bg-[#1a1a1c] border border-[#2a2a2c] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2a2a2c] text-xs font-bold text-billanga-gray tracking-wider uppercase bg-[#141416]/50">
                <th className="py-3 pl-6">Cliente</th>
                <th className="py-3">Contacto</th>
                <th className="py-3">Puntos Fidelidad</th>
                <th className="py-3">Registro</th>
                <th className="py-3 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-billanga-gray">
                    Cargando clientes...
                  </td>
                </tr>
              ) : clientes.length > 0 ? (
                clientes.map((c) => (
                  <tr key={c.id_cliente} className="border-b border-[#2a2a2c]/40 hover:bg-white/[0.02] transition-colors text-sm group">
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-billanga-primary/20 text-billanga-primary flex items-center justify-center font-bold text-lg uppercase shadow-inner">
                          {c.nombre.substring(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{c.nombre}</p>
                          {c.activo ? (
                            <span className="text-[10px] uppercase font-bold text-green-400">Activo</span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold text-red-400">Inactivo</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-billanga-gray text-xs space-y-1">
                      <p>{c.email || "Sin email"}</p>
                      <p>{c.telefono || "Sin teléfono"}</p>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-yellow-500 text-lg">{c.puntos_fidelidad}</span>
                      </div>
                    </td>
                    <td className="py-4 text-billanga-gray text-xs">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <button
                        onClick={() => {
                          setCurrentCliente(c);
                          setEditPuntos(c.puntos_fidelidad.toString());
                          setIsEditing(true);
                        }}
                        className="p-2 bg-[#2a2a2c] hover:bg-billanga-primary text-billanga-gray hover:text-white rounded-lg transition-all"
                        title="Modificar Puntos"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-billanga-gray">
                    No se encontraron clientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalCount > PAGE_SIZE && (
          <div className="px-6 py-4 border-t border-[#2a2a2c] flex items-center justify-between">
            <span className="text-xs text-billanga-gray">
              Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} de {totalCount} clientes
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-[#2a2a2c] hover:bg-[#2a2a2c] text-billanga-gray disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-white font-medium px-2">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg border border-[#2a2a2c] hover:bg-[#2a2a2c] text-billanga-gray disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Editar Puntos */}
      {isEditing && currentCliente && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1c] border border-[#2a2a2c] w-full max-w-sm rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#2a2a2c] flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Editar Puntos</h3>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-[#2a2a2c] rounded-full text-billanga-gray">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-billanga-gray uppercase tracking-wider block mb-2">
                  Cliente: <span className="text-white normal-case">{currentCliente.nombre}</span>
                </label>
                <div className="relative">
                  <Award className="w-5 h-5 text-yellow-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={editPuntos}
                    onChange={(e) => setEditPuntos(e.target.value)}
                    min="0"
                    className="w-full bg-black/40 border border-[#2a2a2c] rounded-lg py-3 pl-10 pr-4 text-white font-mono text-xl focus:outline-none focus:border-billanga-primary"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#2a2a2c] bg-black/20 flex gap-3">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-2.5 rounded-lg border border-[#2a2a2c] hover:bg-[#2a2a2c] text-white font-bold text-sm">Cancelar</button>
              <button onClick={handleUpdatePuntos} className="flex-1 py-2.5 rounded-lg bg-billanga-primary hover:bg-billanga-primary-dark text-white font-bold text-sm">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Cliente */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1c] border border-[#2a2a2c] w-full max-w-sm rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#2a2a2c] flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Nuevo Cliente</h3>
              <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-[#2a2a2c] rounded-full text-billanga-gray">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-billanga-gray block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={newCliente.nombre}
                  onChange={(e) => setNewCliente({...newCliente, nombre: e.target.value})}
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-black/40 border border-[#2a2a2c] rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-billanga-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-billanga-gray block mb-1">Email (Opcional)</label>
                <input
                  type="email"
                  value={newCliente.email}
                  onChange={(e) => setNewCliente({...newCliente, email: e.target.value})}
                  placeholder="juan@ejemplo.com"
                  className="w-full bg-black/40 border border-[#2a2a2c] rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-billanga-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-billanga-gray block mb-1">Teléfono (Opcional)</label>
                <input
                  type="text"
                  value={newCliente.telefono}
                  onChange={(e) => setNewCliente({...newCliente, telefono: e.target.value})}
                  placeholder="+591 71234567"
                  className="w-full bg-black/40 border border-[#2a2a2c] rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-billanga-primary"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#2a2a2c] bg-black/20 flex gap-3">
              <button onClick={() => setIsCreating(false)} className="flex-1 py-2.5 rounded-lg border border-[#2a2a2c] hover:bg-[#2a2a2c] text-white font-bold text-sm">Cancelar</button>
              <button onClick={handleCreateCliente} className="flex-1 py-2.5 rounded-lg bg-billanga-primary hover:bg-billanga-primary-dark text-white font-bold text-sm">Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
