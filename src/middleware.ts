import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 개발 환경에서는 모든 요청 허용
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  // 프로덕션 환경에서는 로그인 페이지로 리다이렉트
  const isLoggedIn = request.cookies.has('next-auth.session-token')
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/stores/:path*",
    "/store/:path*",
  ],
}

