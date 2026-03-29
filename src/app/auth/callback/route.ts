import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const user = data.user;
      // 프로필이 없으면 생성 (스키마 적용 전 가입한 사용자 대응)
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existing) {
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email ?? '',
          name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? '이름 없음',
          role: 'student',
        });
      }

      return NextResponse.redirect(`${origin}/my-books`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
