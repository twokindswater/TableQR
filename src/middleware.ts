import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionToken =
    request.cookies.get('next-auth.session-token') ||
    request.cookies.get('__Secure-next-auth.session-token')

  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url)
    const callbackTarget = request.nextUrl.pathname + request.nextUrl.search
    if (callbackTarget && callbackTarget !== '/') {
      loginUrl.searchParams.set('callbackUrl', callbackTarget)
    }
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/stores/:path*'],
}
