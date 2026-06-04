import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Falta el parametro 'url'", { status: 400 });
  }

  try {
    // Petición al servidor original (Supabase) desde el backend de Next.js
    const response = await fetch(url);
    if (!response.ok) {
      return new NextResponse("Error al descargar la imagen", { status: response.status });
    }

    const contentType = response.headers.get("content-type");
    const arrayBuffer = await response.arrayBuffer();

    // Devolver la imagen al cliente como si fuera nuestra
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable", // Cachear por 1 año
      },
    });
  } catch (error) {
    console.error("Error en proxy de imagenes:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
