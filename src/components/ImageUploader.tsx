"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
}

export default function ImageUploader({ value, onChange, folder = "general" }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    // Validar que sea imagen
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona solo archivos de imagen (JPG, PNG, WebP).");
      return;
    }

    setIsUploading(true);
    try {
      // Generar nombre de archivo único
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("public_images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("public_images")
        .getPublicUrl(fileName);

      onChange(publicUrl);
    } catch (error: any) {
      console.error("Error subiendo imagen:", error);
      alert("Hubo un error al subir la imagen. Verifica tu conexión y los permisos.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {value ? (
        <div className="relative w-full h-48 rounded-xl border border-white/10 overflow-hidden group bg-neutral-900/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Vista previa"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
            <button
              type="button"
              onClick={removeImage}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-lg transform hover:scale-110"
              title="Eliminar imagen"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden
            ${isDragging ? "border-amber-500 bg-amber-500/10 scale-[1.02]" : "border-white/20 hover:border-amber-500/50 hover:bg-white/5"}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-3 text-amber-500">
              <Loader2 size={32} className="animate-spin" />
              <p className="text-sm font-medium animate-pulse">Subiendo imagen...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 text-neutral-400 group-hover:text-neutral-300">
              <div className="p-3 bg-white/5 rounded-full">
                <UploadCloud size={32} className={`${isDragging ? "text-amber-500" : "text-neutral-400"}`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white mb-1">Haz clic o arrastra una imagen</p>
                <p className="text-xs opacity-70">JPG, PNG o WebP (Max. 5MB)</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
