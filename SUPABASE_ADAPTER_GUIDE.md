# NextAuth + SupabaseAdapter 사용 가이드

## 🤔 언제 SupabaseAdapter를 사용해야 할까?

### JWT 전략 (현재 사용 중) ✅
**사용 시기:**
- 빠른 인증이 필요한 경우
- 세션 데이터가 적은 경우
- 확장성이 중요한 경우

### Database 전략 (SupabaseAdapter)
**사용 시기:**
- 세션을 즉시 무효화해야 하는 경우
- 사용자 로그인 기록을 추적해야 하는 경우
- 여러 디바이스에서 세션 관리가 필요한 경우

---

## 🔧 SupabaseAdapter 설정 방법

### 1. 패키지 설치
```bash
npm install @next-auth/supabase-adapter
```

### 2. Supabase 테이블 생성
NextAuth는 다음 테이블이 필요합니다:
- `users`
- `accounts`
- `sessions`
- `verification_tokens`

SQL 스크립트: https://authjs.dev/reference/adapter/supabase

### 3. auth.ts 수정
```typescript
import { SupabaseAdapter } from '@next-auth/supabase-adapter'

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // ← 여전히 필요!
}
```

### 4. 환경 변수 추가
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
```

---

## ⚙️ 두 "Secret"의 역할

### SUPABASE_SERVICE_ROLE_KEY
- **역할**: Supabase 데이터베이스에 읽기/쓰기 권한
- **사용처**: SupabaseAdapter가 세션 데이터를 저장할 때
- **발급**: Supabase Dashboard → Settings → API

### NEXTAUTH_SECRET
- **역할**: 쿠키 서명 및 CSRF 토큰 생성
- **사용처**: 모든 NextAuth 요청에서 보안 유지
- **생성**: `openssl rand -base64 32`

---

## 🎯 TableQR 프로젝트 권장사항

**현재 JWT 전략을 유지하는 것을 권장합니다.**

**이유:**
1. **간단함**: 추가 테이블 불필요
2. **성능**: DB 조회 없이 빠른 인증
3. **충분함**: 우리 use case에 Database 세션이 꼭 필요하지 않음

**Supabase는:**
- Stores, Menus, Categories 등 **애플리케이션 데이터** 저장
- NextAuth 세션 저장소로는 사용하지 않음

---

## 📚 참고 문서

- [NextAuth.js Adapters](https://next-auth.js.org/adapters/overview)
- [Supabase Adapter](https://authjs.dev/reference/adapter/supabase)
- [JWT vs Database Sessions](https://next-auth.js.org/configuration/options#session)

