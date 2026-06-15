import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";

const createUserSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  id_rol: z.string().uuid("ID de rol inválido"),
  id_sucursal: z.string().uuid("ID de sucursal inválido").optional(),
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function getCallerLevel(): Promise<number | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("usuarios")
    .select("roles(nivel)")
    .eq("auth_id", user.id)
    .maybeSingle();

  const rolesArr = data?.roles as { nivel: number }[] | null;
  return (Array.isArray(rolesArr) ? rolesArr[0] : null)?.nivel ?? null;
}

export async function POST(req: Request) {
  const callerLevel = await getCallerLevel();
  if (!callerLevel || callerLevel < 4) {
    return NextResponse.json(
      { error: "No tienes permiso para realizar esta acción." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const result = createUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }
    const { nombre, email, password, id_rol, id_sucursal } = result.data;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: nombre },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "El correo ya está registrado en el sistema." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    const { data: userData, error: userError } = await supabaseAdmin
      .from("usuarios")
      .insert({
        id_usuario: userId,
        auth_id: userId,
        nombre,
        email,
        id_rol,
        activo: true,
      })
      .select();

    if (userError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    if (id_sucursal) {
      await supabaseAdmin.from("usuario_sucursal").insert({
        id_usuario: userId,
        id_sucursal,
        id_rol,
      });
    }

    return NextResponse.json({ success: true, user: userData[0] }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const callerLevel = await getCallerLevel();
  if (!callerLevel || callerLevel < 4) {
    return NextResponse.json(
      { error: "No tienes permiso para realizar esta acción." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const idUsuario = searchParams.get("id");

    if (!idUsuario) {
      return NextResponse.json({ error: "ID de usuario es requerido" }, { status: 400 });
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(idUsuario);
    if (authError) {
      console.warn("Auth delete warning:", authError.message);
    }

    const { error: dbError } = await supabaseAdmin
      .from("usuarios")
      .update({ activo: false, deleted_at: new Date().toISOString() })
      .eq("id_usuario", idUsuario);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    await supabaseAdmin
      .from("usuario_sucursal")
      .update({ activo: false, fecha_fin: new Date().toISOString() })
      .eq("id_usuario", idUsuario);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
