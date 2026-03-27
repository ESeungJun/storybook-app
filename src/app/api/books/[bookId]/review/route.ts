import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  // 선생님 권한 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'teacher') {
    return NextResponse.json({ error: '선생님만 가능합니다.' }, { status: 403 });
  }

  const body = await request.json();
  const { action, comment } = body as { action: 'approve' | 'reject'; comment?: string };

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    status: action === 'approve' ? 'approved' : 'rejected',
  };

  if (action === 'reject' && comment) {
    updates.teacher_comment = comment;
  }

  if (action === 'approve') {
    updates.teacher_comment = null;
  }

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
