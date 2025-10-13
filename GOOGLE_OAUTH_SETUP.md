# Google OAuth 설정 가이드

이 가이드는 TableQR에서 Google 로그인을 사용하기 위한 설정 방법을 안내합니다.

---

## 📋 준비사항

- Google 계정
- Google Cloud Console 접근 권한

---

## 🔧 설정 단계

### 1단계: Google Cloud Console 접속

1. https://console.cloud.google.com 접속
2. Google 계정으로 로그인

### 2단계: 새 프로젝트 생성

1. 상단 프로젝트 선택 드롭다운 클릭
2. "새 프로젝트" 버튼 클릭
3. 프로젝트 이름 입력 (예: "TableQR")
4. "만들기" 버튼 클릭
5. 프로젝트 생성 완료 후 해당 프로젝트 선택

### 3단계: OAuth 동의 화면 구성

1. 좌측 메뉴에서 "API 및 서비스" > "OAuth 동의 화면" 선택
2. 사용자 유형 선택:
   - **외부(External)**: 누구나 로그인 가능
   - **내부(Internal)**: Google Workspace 조직 내부만 (기업용)
3. "만들기" 버튼 클릭
4. OAuth 동의 화면 정보 입력:
   - **앱 이름**: TableQR
   - **사용자 지원 이메일**: 본인 이메일
   - **개발자 연락처 정보**: 본인 이메일
5. "저장 후 계속" 클릭

### 4단계: 범위(Scope) 설정

1. "범위 추가 또는 삭제" 클릭
2. 다음 범위 선택:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
3. "저장 후 계속" 클릭

### 5단계: OAuth 2.0 클라이언트 ID 생성

1. 좌측 메뉴에서 "API 및 서비스" > "사용자 인증 정보" 선택
2. 상단의 "+ 사용자 인증 정보 만들기" 클릭
3. "OAuth 클라이언트 ID" 선택
4. 애플리케이션 유형: "웹 애플리케이션" 선택
5. 이름 입력 (예: "TableQR Web Client")
6. **승인된 자바스크립트 원본** 추가:
   ```
   http://localhost:3000
   ```
7. **승인된 리디렉션 URI** 추가:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
8. "만들기" 버튼 클릭

### 6단계: 클라이언트 ID 및 시크릿 복사

1. 생성 완료 후 팝업에서 다음 정보 복사:
   - **클라이언트 ID**: `xxxxx.apps.googleusercontent.com`
   - **클라이언트 보안 비밀번호**: `GOCSPX-xxxxx`
2. 나중에 다시 확인하려면:
   - "사용자 인증 정보" 페이지에서 생성한 OAuth 클라이언트 클릭

---

## ⚙️ 환경 변수 설정

### 1. .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성합니다:

```bash
cp .env.example .env.local
```

### 2. 환경 변수 입력

`.env.local` 파일을 열고 다음 값을 입력합니다:

```env
# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here
```

### 3. NEXTAUTH_SECRET 생성

터미널에서 다음 명령어로 시크릿 생성:

```bash
openssl rand -base64 32
```

생성된 값을 `NEXTAUTH_SECRET`에 입력합니다.

---

## 🚀 프로덕션 배포 시 추가 설정

### 1. 프로덕션 도메인 추가

Google Cloud Console > OAuth 클라이언트 설정:

**승인된 자바스크립트 원본**:
```
https://yourdomain.com
```

**승인된 리디렉션 URI**:
```
https://yourdomain.com/api/auth/callback/google
```

### 2. 환경 변수 업데이트

프로덕션 환경의 환경 변수:

```env
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
NEXTAUTH_SECRET=production_secret_here
```

---

## ✅ 테스트

### 1. 개발 서버 재시작

```bash
npm run dev
```

### 2. 로그인 테스트

1. http://localhost:3000/login 접속
2. "Google로 로그인" 버튼 클릭
3. Google 계정 선택
4. 권한 허용
5. 로그인 성공 후 `/stores`로 리다이렉트

---

## 🐛 문제 해결

### 오류: "redirect_uri_mismatch"

- **원인**: 리디렉션 URI가 Google Cloud Console에 등록되지 않음
- **해결**: OAuth 클라이언트 설정에서 정확한 URI 추가
  ```
  http://localhost:3000/api/auth/callback/google
  ```

### 오류: "invalid_client"

- **원인**: CLIENT_ID 또는 CLIENT_SECRET이 잘못됨
- **해결**: `.env.local` 파일의 값 확인 및 재설정

### 로그인 후 페이지가 로드되지 않음

- **원인**: NEXTAUTH_SECRET이 설정되지 않음
- **해결**: 새 시크릿 생성 및 설정

---

## 📚 참고 자료

- [NextAuth.js 공식 문서](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 가이드](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)

---

**설정 완료 후 Phase 4로 진행하세요!** 🎉

