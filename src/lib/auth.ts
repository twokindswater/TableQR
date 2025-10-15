import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

import { Session } from "next-auth";

// 개발 환경용 mock 세션
const mockSession: Session = {
  user: {
    id: '104085693824085358553',
    name: 'Test User',
    email: 'mekingme@gmail.com',
    image: null,
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후 만료
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: process.env.NODE_ENV === 'production',
  callbacks: {
    async signIn({ user, account, profile }) {
      // 로그인은 항상 허용하고, 계정 생성은 클라이언트 사이드에서 처리
      console.log('Google 로그인 성공:', user.email);
      return true;
    },
    async session({ session, token }) {
      // 실제 세션이 있으면 사용, 없으면 개발 환경에서 mock 세션 사용
      if (!session && process.env.NODE_ENV === 'development') {
        return mockSession;
      }

      if (session?.user && token.sub) {
        // 세션에 사용자 ID 추가
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}