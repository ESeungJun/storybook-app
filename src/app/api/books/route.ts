import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const authorId = searchParams.get('authorId');

  let query = supabase
    .from('books')
    .select('*, profiles(name)')
    .order('updated_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (authorId) query = query.eq('author_id', authorId);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const body = await request.json();
  const title = body.title || '제목 없음';

  // 책 생성
  const { data: book, error: bookError } = await supabase
    .from('books')
    .insert({ title, author_id: user.id })
    .select()
    .single();

  if (bookError) {
    console.error('[books POST] bookError:', JSON.stringify(bookError));
    return NextResponse.json({ error: bookError.message }, { status: 500 });
  }

  // 첫 페이지 자동 생성
  const { error: pageError } = await supabase
    .from('pages')
    .insert({
      book_id: book.id,
      page_order: 0,
      template_type: 'full_illustration',
      canvas_data: {},
    });

  if (pageError) {
    return NextResponse.json({ error: pageError.message }, { status: 500 });
  }

  return NextResponse.json(book, { status: 201 });
}
