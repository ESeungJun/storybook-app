# 우리들의 그림책 📚

학생들이 직접 그림책을 만들고, 선생님이 검토·승인하는 그림책 제작 플랫폼입니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 그림판 | Fabric.js 6 |
| 백엔드/DB | Supabase (PostgreSQL) |
| 인증 | Supabase Auth (Google OAuth) |
| 상태관리 | Zustand |
| 테스트 | Playwright (E2E) |

---

## 주요 기능

### 학생
- Google 계정으로 로그인
- 그림책 생성 / 편집 / 삭제
- 캔버스에 자유롭게 그림 그리기 (펜, 연필, 마커, 지우개)
- 텍스트 추가, 이미지 업로드
- 레이아웃 템플릿 선택 (전면그림, 그림+텍스트 등 5종)
- 완성된 그림책 선생님에게 제출
- 미리보기로 결과물 확인

### 선생님
- 제출된 그림책 목록 확인 (대시보드)
- 그림책 승인 / 반려 (반려 시 코멘트 입력)
- 승인된 그림책은 갤러리에 전시

### 갤러리
- 승인된 그림책 전체 공개 열람
- 페이지 넘기기 애니메이션

---

## 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/ESeungJun/storybook-app.git
cd storybook-app
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Supabase 설정

**데이터베이스 스키마 적용**
Supabase 대시보드 → SQL Editor → `supabase/schema.sql` 내용 붙여넣고 실행

**RLS 정책 추가** (스키마 적용 후 반드시 실행)
```sql
-- 사용자 프로필 직접 생성 허용
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 책 상태 변경 허용 (submit 등)
DROP POLICY "books_update_own" ON public.books;
CREATE POLICY "books_update_own" ON public.books
  FOR UPDATE
  USING (auth.uid() = author_id AND status IN ('draft', 'rejected'))
  WITH CHECK (auth.uid() = author_id);
```

**Google OAuth 설정**
1. [Google Cloud Console](https://console.cloud.google.com) → OAuth 2.0 클라이언트 생성
2. Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
3. Supabase 대시보드 → Authentication → Providers → Google → Client ID/Secret 입력
4. Supabase 대시보드 → Authentication → URL Configuration → Redirect URLs에 추가:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3001/auth/callback`

### 5. 로컬 실행

```bash
npm run dev
```

`http://localhost:3000` 접속

---

## 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/          # 로그인 페이지
│   ├── api/             # REST API 라우트
│   │   ├── books/       # 그림책 CRUD + 제출/검토
│   │   ├── pages/       # 페이지 CRUD
│   │   └── upload/      # 이미지 업로드
│   ├── auth/callback/   # Google OAuth 콜백
│   ├── book/[bookId]/   # 그림책 뷰어
│   ├── dashboard/       # 선생님 대시보드
│   ├── editor/[bookId]/ # 그림책 편집기
│   └── my-books/        # 내 작품함
├── components/
│   ├── editor/          # 에디터 컴포넌트
│   ├── gallery/         # 갤러리 카드
│   ├── layout/          # Header, AuthGuard
│   └── ui/              # 공통 UI
├── lib/
│   ├── fabric/          # Fabric.js 설정, 템플릿
│   └── supabase/        # Supabase 클라이언트
├── providers/           # AuthProvider
├── stores/              # Zustand 에디터 상태
└── types/               # TypeScript 타입 정의
```

---

## 그림책 상태 흐름

```
draft → submitted → approved  (갤러리 공개)
                 ↘ rejected   (학생에게 반려, 재편집 가능)
```

---

## 테스트

```bash
# E2E 테스트 실행 (브라우저 창 표시)
npx playwright test

# UI 모드로 실행
npx playwright test --ui
```

---

## 선생님 계정 만들기

Google 로그인 후 Supabase 대시보드에서 `profiles` 테이블의 `role`을 `teacher`로 직접 변경
