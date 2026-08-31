import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(req: NextRequest) {
  // Use getToken directly to avoid the re-export issues in Turbopack
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || "your-super-secret-key-that-should-be-very-long" 
  })

  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth internal routes)
     * - api/transact (External Agent API)
     * - api/webhooks (Stripe / External Webhooks)
     * - login (login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|api/transact|api/webhooks|login|_next/static|_next/image|favicon.ico).*)',
  ],
}
