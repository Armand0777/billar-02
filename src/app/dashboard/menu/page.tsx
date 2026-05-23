"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function MenuPage() {
  const router = useRouter();

  useEffect(() => {
    // El editor de menú/productos está integrado en Inventario
    router.replace("/dashboard/inventario");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-malandro-gray">
      <RefreshCw className="w-10 h-10 animate-spin text-malandro-red mb-4" />
      <p className="text-sm">Redirigiendo al Inventario & Productos...</p>
    </div>
  );
}
