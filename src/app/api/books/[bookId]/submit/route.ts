import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  // 본인 책인지 + draft/rejected 상태인지 확인
  const { data: book } = await supabase
    .from('books')
    .select('status, author_id')
    .eq('id', params.bookId)
    .single();

  if (!book || book.author_id !== user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  if (book.status !== 'draft' && book.status !== 'rejected') {
    return NextResponse.json({ error: '제출할 수 없는 상태입니다.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('books')
    .update({ status: 'submitted', teacher_comment: null })
    .eq('id', params.bookId)
    .select()
    .single();

  if (error) {
    console.error('[submit] error:', JSON.stringify(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
