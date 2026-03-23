import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // NOTE: getAll/setAll is the @supabase/ssr ^0.5.0 API.
      // Run `pnpm install` after upgrading package.json for types to resolve.
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          )
        },
      } as any,
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users away from protected routes
  const { pathname } = request.nextUrl
  const isProtected = pathname.startsWith('/dashboard')
  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/get-started') ||
    pathname.startsWith('/book-demo') ||
    pathname.startsWith('/contact')

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Suppress unused variable warning — isAuthPage reserved for future redirect-if-logged-in logic
  void isAuthPage

  return response
}
