import { NextRequest, NextResponse } from "next/server";

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname;
    return parsed.hostname === supabaseHost && parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Falta el parametro 'url'", { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return new NextResponse("Dominio no permitido", { status: 403 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new NextResponse("Error al descargar la imagen", { status: response.status });
    }

    const contentType = response.headers.get("content-type");
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error en proxy de imagenes:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
