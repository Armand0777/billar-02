import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    // 1. Crear cliente Supabase (Edge-compatible) y refrescar sesión
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // 2. Obtener usuario autenticado (refresca cookies automáticamente)
    // IMPORTANTE: No agregar lógica entre createServerClient y getUser()
    const { data: { user } } = await supabase.auth.getUser()

    // 3. Proteger rutas del Dashboard
    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')

    if (isDashboardRoute) {
      if (!user) {
        // Sin sesión → redirigir al login
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/login'
        return NextResponse.redirect(loginUrl)
      }

      // Verificar que sea staff (existe en tabla usuarios)
      const { data: staffUser, error } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (error || !staffUser) {
        // No es empleado → redirigir al catálogo público
        const homeUrl = request.nextUrl.clone()
        homeUrl.pathname = '/'
        return NextResponse.redirect(homeUrl)
      }
    }

    // 4. Si el usuario ya tiene sesión y va a /login, redirigir al dashboard
    if (user && request.nextUrl.pathname === '/login') {
      const { data: staffUser } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (staffUser) {
        const dashUrl = request.nextUrl.clone()
        dashUrl.pathname = '/dashboard'
        return NextResponse.redirect(dashUrl)
      }
    }
  } catch (error) {
    console.error('Proxy error:', error)
  }

  return supabaseResponse
}

// Rutas donde se aplicará el proxy
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any image/asset files in public
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
