import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 개발 환경에서는 모든 요청 허용
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  // 프로덕션 환경에서는 세션 토큰 확인
  // NextAuth는 환경에 따라 다른 쿠키 이름을 사용합니다
  const sessionToken = request.cookies.get('next-auth.session-token') || 
                      request.cookies.get('__Secure-next-auth.session-token')
  
  // 디버깅을 위한 로그 (Vercel 로그에서 확인 가능)
  console.log('Middleware check:', {
    url: request.url,
    hasSessionToken: !!sessionToken,
    cookies: request.cookies.getAll().map(c => c.name)
  })
  
  if (!sessionToken) {
    console.log('No session token found, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  console.log('Session token found, allowing access')
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/stores/:path*",
    "/store/:path*",
  ],
}

