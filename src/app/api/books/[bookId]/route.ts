import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  const supabase = createClient();

  const { data: book, error } = await supabase
    .from('books')
    .select('*, profiles(name)')
    .eq('id', params.bookId)
    .single();

  if (error || !book) {
    return NextResponse.json({ error: '그림책을 찾을 수 없습니다.' }, { status: 404 });
  }

  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('book_id', params.bookId)
    .order('page_order', { ascending: true });

  return NextResponse.json({ ...book, pages: pages || [] });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.cover_image_url !== undefined) updates.cover_image_url = body.cover_image_url;

  const { data, error } = await supabase
    .from('books')
    .update(updates)
    .eq('id', params.bookId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', params.bookId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
