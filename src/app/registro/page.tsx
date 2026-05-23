"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, Mail, Lock, User, Phone, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function RegistroPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const nombre = formData.get("nombre") as string;
    const telefono = formData.get("telefono") as string;

    if (!email || !password || !nombre) {
      setError("Faltan campos obligatorios.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          telefono: telefono || null,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess("¡Cuenta creada exitosamente! Redirigiendo...");
    setTimeout(() => {
      router.push("/");
    }, 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-[family-name:var(--font-geist-sans)] px-4 py-12">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-malandro-red opacity-10 blur-[100px] rounded-full pointer-events-none" />

      {/* Botón regresar */}
      <Link href="/" className="absolute top-6 left-6 text-malandro-gray hover:text-white flex items-center gap-2 transition-colors z-20">
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Volver al inicio</span>
      </Link>

      <div className="glass-panel w-full max-w-md p-8 md:p-10 rounded-2xl z-10 animate-in fade-in zoom-in-95 duration-500 my-auto">
        
        {/* Header del Form */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-malandro-red relative mb-4">
            <Image 
              src="/logo.png" 
              alt="Logo El Malandro" 
              fill 
              sizes="64px"
              className="object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold text-white text-center">Únete a El Malandro</h2>
          <p className="text-malandro-gray text-sm mt-2 text-center">Crea tu cuenta para reservas y torneos</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 text-sm p-3 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-malandro-gray block">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-malandro-gray/50" />
              <input 
                type="text" 
                name="nombre"
                placeholder="Tu nombre" 
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-malandro-gray/50 focus:outline-none focus:border-malandro-red focus:ring-1 focus:ring-malandro-red transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-malandro-gray block">Teléfono (opcional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-malandro-gray/50" />
              <input 
                type="tel" 
                name="telefono"
                placeholder="+58 412 1234567" 
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-malandro-gray/50 focus:outline-none focus:border-malandro-red focus:ring-1 focus:ring-malandro-red transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-malandro-gray block">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-malandro-gray/50" />
              <input 
                type="email" 
                name="email"
                placeholder="tu@email.com" 
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-malandro-gray/50 focus:outline-none focus:border-malandro-red focus:ring-1 focus:ring-malandro-red transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-malandro-gray block">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-malandro-gray/50" />
              <input 
                type="password" 
                name="password"
                placeholder="••••••••" 
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-malandro-gray/50 focus:outline-none focus:border-malandro-red focus:ring-1 focus:ring-malandro-red transition-all"
                required
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 rounded-lg bg-malandro-red hover:bg-malandro-red-dark text-white font-bold transition-all shadow-[0_0_15px_rgba(211,47,47,0.3)] hover:shadow-[0_0_25px_rgba(211,47,47,0.5)] mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        {/* Footer del Form */}
        <p className="text-center text-sm text-malandro-gray mt-6">
          ¿Ya tienes cuenta? <Link href="/login" className="text-white hover:text-malandro-red transition-colors font-medium">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
