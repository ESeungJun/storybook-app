import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const body = await request.json();
  const { bookId, templateType = 'full_illustration' } = body;

  // 현재 페이지 수 확인
  const { data: pages } = await supabase
    .from('pages')
    .select('page_order')
    .eq('book_id', bookId)
    .order('page_order', { ascending: false })
    .limit(1);

  const nextOrder = pages && pages.length > 0 ? pages[0].page_order + 1 : 0;

  const { data, error } = await supabase
    .from('pages')
    .insert({
      book_id: bookId,
      page_order: nextOrder,
      template_type: templateType,
      canvas_data: {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
