# 환경 변수 설정 가이드

## 📋 필수 환경 변수

현재 Phase 3에서 필요한 환경 변수는 다음과 같습니다.

### 1. .env 파일 생성

프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 추가하세요:

```bash
# NextAuth 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# Google OAuth 자격 증명
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 2. 각 환경 변수 설명

#### NEXTAUTH_URL
- **설명**: 애플리케이션이 실행되는 URL
- **개발 환경**: `http://localhost:3000`
- **프로덕션**: 실제 배포된 도메인 (예: `https://tableqr.com`)

#### NEXTAUTH_SECRET
- **설명**: JWT 토큰 암호화에 사용되는 비밀 키
- **생성 방법**:
  ```bash
  openssl rand -base64 32
  ```
  또는 온라인에서 랜덤 문자열 생성
- **주의**: 프로덕션에서는 반드시 안전한 랜덤 문자열 사용

#### GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
- **설명**: Google OAuth 인증에 필요한 자격 증명
- **발급 방법**: `GOOGLE_OAUTH_SETUP.md` 파일 참조
- **Google Cloud Console**: https://console.cloud.google.com/

## 🔒 보안 주의사항

1. **.env 파일은 절대 Git에 커밋하지 마세요**
   - 이미 `.gitignore`에 포함되어 있습니다
   
2. **.env.example 파일 사용**
   - 팀원들과 공유할 때는 `.env.example` 파일을 사용하세요
   - 실제 값은 제외하고 템플릿만 공유합니다

3. **프로덕션 환경**
   - Vercel, Netlify 등의 배포 플랫폼에서 환경 변수를 별도로 설정하세요

## 🚀 다음 단계 (Phase 4)

Phase 4에서는 다음 환경 변수가 추가로 필요합니다:

```bash
# Supabase 설정 (Phase 4에서 설정)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## ✅ 확인 방법

1. `.env` 파일이 생성되었는지 확인
2. Google OAuth 자격 증명 발급 완료
3. `npm run dev` 실행하여 에러 없이 시작되는지 확인

## 📚 참고 문서

- [NextAuth.js 설정](https://next-auth.js.org/configuration/options)
- [Google OAuth 설정](./GOOGLE_OAUTH_SETUP.md)
- [환경 변수 사용법](https://nextjs.org/docs/basic-features/environment-variables)

