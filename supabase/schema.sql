-- ==========================================
-- 그림책 제작 플랫폼 DB 스키마
-- Supabase SQL Editor에서 실행
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PROFILES (extends auth.users)
-- ==========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 회원가입 시 자동 프로필 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '이름 없음'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- BOOKS
-- ==========================================
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL DEFAULT '제목 없음',
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  cover_image_url TEXT,
  teacher_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_books_author ON public.books(author_id);
CREATE INDEX idx_books_status ON public.books(status);

-- ==========================================
-- PAGES
-- ==========================================
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  page_order INTEGER NOT NULL DEFAULT 0,
  template_type TEXT NOT NULL DEFAULT 'full_illustration'
    CHECK (template_type IN (
      'full_illustration',
      'illustration_top',
      'illustration_bottom',
      'illustration_left',
      'full_text'
    )),
  canvas_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  text_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pages_book ON public.pages(book_id);
CREATE INDEX idx_pages_order ON public.pages(book_id, page_order);

-- ==========================================
-- updated_at 자동 갱신
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Books
CREATE POLICY "books_select_approved" ON public.books
  FOR SELECT USING (status = 'approved');

CREATE POLICY "books_select_own" ON public.books
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "books_select_teacher" ON public.books
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "books_insert_own" ON public.books
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "books_update_own" ON public.books
  FOR UPDATE USING (
    auth.uid() = author_id
    AND status IN ('draft', 'rejected')
  );

CREATE POLICY "books_update_teacher" ON public.books
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "books_delete_own" ON public.books
  FOR DELETE USING (
    auth.uid() = author_id AND status = 'draft'
  );

-- Pages
CREATE POLICY "pages_select" ON public.pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.id = book_id
      AND (
        b.status = 'approved'
        OR b.author_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'teacher'
        )
      )
    )
  );

CREATE POLICY "pages_insert" ON public.pages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE id = book_id AND author_id = auth.uid()
    )
  );

CREATE POLICY "pages_update" ON public.pages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE id = book_id AND author_id = auth.uid()
      AND status IN ('draft', 'rejected')
    )
  );

CREATE POLICY "pages_delete" ON public.pages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE id = book_id AND author_id = auth.uid()
      AND status IN ('draft', 'rejected')
    )
  );

-- ==========================================
-- STORAGE BUCKET (Supabase 대시보드에서 실행)
-- ==========================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('book-images', 'book-images', true);
--
-- CREATE POLICY "book_images_upload" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'book-images' AND auth.uid() IS NOT NULL
--   );
--
-- CREATE POLICY "book_images_select" ON storage.objects
--   FOR SELECT USING (bucket_id = 'book-images');
