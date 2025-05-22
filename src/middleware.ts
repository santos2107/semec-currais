import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs" // Auth Helpers são ótimos para middleware
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res }) // Auth Helpers

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Se não está logado e tenta acessar rota protegida (não é /login)
  if (!session && !pathname.startsWith("/login") && !pathname.startsWith("/api/auth")) {
    // '/api/auth' para callbacks
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Se está logado e tenta acessar /login, redireciona para dashboard
  if (session && pathname.startsWith("/login")) {
    const url = req.nextUrl.clone()
    url.pathname = "/dashboard" // ou sua rota principal pós-login
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  // Execute o middleware em todas as rotas, exceto assets e API interna do Next.js
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - mas queremos que /api/auth seja verificado de certa forma, então é um balanço
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /login (para evitar loop de redirecionamento)
     */
    // '/((?!api|_next/static|_next/image|favicon.ico|login).*)', // Exemplo mais restritivo
    "/((?!_next/static|_next/image|favicon.ico).*)", // Amplo, o código acima lida com /login
  ],
}
